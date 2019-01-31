import cloneBuffer from 'clone-buffer'
import delay from 'delay'
import fs from 'fs-extra'
import ms from 'ms'
import path from 'path'
import puppeteer from 'puppeteer'
import request from 'superagent'
import treeify from 'treeify'

import config from 'infrastructure/config'

const screenshotDir = path.join(config._root, '../../data/screenshots')

console.log(screenshotDir)

const loadPage = async (page, url, mode = 'load') => {
  await page._client.send('Performance.enable')

  if (url) {
    await page.goto(url, {
      waitUntil: mode,
      timeout: ms('5m')
    })
  } else {
    await page.reload({
      waitUntil: mode,
      timeout: ms('5m')
    })
  }

  // const metrics = await page.metrics()

  // return metrics

  const performance = JSON.parse(await page.evaluate(
    () => JSON.stringify(window.performance)
  ))

  const latestTiming = Object.entries(performance.timing).reduce(
    (max, [ key, value ]) => max.value > value ? max : { key, value }, { value: 0 }
  )

  console.log(latestTiming)

  return {
    // _: performance,
    fullTimeLoad: latestTiming.value - performance.timing.navigationStart
  }

  return performance

  const timingMetric = JSON.parse(rawTimingMetric)

  const dnsLookup = timingMetric.domainLookupEnd - timingMetric.domainLookupStart
  const tcpConnect = timingMetric.connectEnd - timingMetric.connectStart
  const request = timingMetric.responseStart - timingMetric.requestStart
  const response = timingMetric.responseEnd - timingMetric.responseStart

  const fullTimeLoad = timingMetric.loadEventEnd - timingMetric.navigationStart
  const htmlLoadTime = dnsLookup + tcpConnect + request + response

  const result = {
    dnsLookup,
    tcpConnect,
    htmlLoadTime,
    request,
    response,
    fullTimeLoad
  }

  return result
}

const normalizeUrl = (protocol, domain) => (url) => {
  if (url.indexOf('/') === 0) {
    if (url.indexOf('//') === 0) {
      return `${protocol}${url}`
    }

    return `${protocol}//${domain}${url}`
  }

  return url
}

const initBrowser = async (params) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // '--shm-size=1gb',
      '--window-size=1440,900',
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*'
    ],
    ignoreHTTPSErrors: true
  })

  return browser
}

export const analyze = async (params) => {
  const {
    url,
    identifier,
    mode = 'networkidle2'
  } = params

  const state = {
    inspect: false,
    images: {}
  }

  const browser = await initBrowser(params)

  try {
    // create a new incognito browser context
    const incognitoContext = await browser.createIncognitoBrowserContext()
    const originPage = await incognitoContext.newPage()

    try {
      // load origin page
      console.log('Load origin page')
      console.time('Load origin page')

      // set request interception
      await originPage.setRequestInterception(true)

      originPage.on('request', (request) => {
        if (!state.inspect && request.resourceType() === 'image') {
          const url = request.url()

          state.images[url] = { url }
        }

        request.continue()
      })

      const first = await loadPage(originPage, url)

      console.timeEnd('Load origin page')
      console.log(first)

      await fs.ensureDir(screenshotDir)

      await originPage.screenshot({
        path: path.join(screenshotDir, `${ identifier }-origin.jpeg`),
        fullPage: true
      })

      state.inspect = true

      const location = await originPage.evaluate(() => ({
        hostname: location.hostname,
        protocol: location.protocol
      }))

      const normalize = normalizeUrl(location.protocol, location.hostname)

      // collection <img> tags
      const imgTags = await originPage.evaluate(() => {
        const tags = document.querySelectorAll('img')

        return Array.from(tags || []).map(
          (tag) => ({
            natural: {
              width: tag.naturalWidth,
              height: tag.naturalHeight
            },
            displayed: {
              width: tag.clientWidth,
              height: tag.clientHeight
            },
            src: tag.getAttribute('src')
          })
        )
      })

      imgTags.forEach((image) => {
        const url = normalize(image.src.trim())
        const { displayed } = image

        state.images[url] = {
          ...state.images[url],
          ...image,
          optimizedUrl: displayed ?
            `${ config.endpoint }/u?url=${ encodeURIComponent(url) }&w=${ displayed.width }&h=${  displayed.height }` :
            `${ config.endpoint }/u?url=${ encodeURIComponent(url) }`
        }
      })

      // console.log(treeify.asTree(state.images, true))

      // await delay(ms('1s'))
      // // reload origin page (respect browser's cache)
      // console.log('Reload origin page')
      // console.time('Reload origin page')

      // state.cache = {}

      // await originPage.on('response', async (response) => {
      //   console.log(`${ response.url() } - cache: ${ response.fromCache() }`)

      //   if (response.fromCache()) {
      //     const buffer = await response.buffer()

      //     state.cache[response.url()] = response
      //     state.cache[response.url()].buffer = cloneBuffer(buffer)
      //   }
      // })

      // const second = await loadPage(originPage)

      // console.timeEnd('Reload origin page')
      // console.log(second)

      // await delay(ms('1s'))

      // console.log('Reload origin page 2')
      // console.time('Reload origin page 2')

      // const third = await loadPage(originPage)

      // console.timeEnd('Reload origin page 2')
      // console.log(third)

    } catch (e) {
      throw e
    } finally {
      await originPage.close()

      console.log('Origin page closed')
    }

    // warm up optimized content
    console.time('Warm up cache')

    try {
      await Promise.all(
        Object.values(state.images).map(
          ({ optimizedUrl }) => request.get(optimizedUrl)
        )
      )
    } catch (e) {
      // skip
    } finally {
      console.timeEnd('Warm up cache')
    }

    const optimizedPage = await incognitoContext.newPage()

    try {
      // add request interception
      await optimizedPage.setRequestInterception(true)

      // handle requests
      optimizedPage.on('request', async (request) => {
        const url = request.url()

        if (request.resourceType() === 'image') {
          if (state.images[url] && state.images[url].optimizedUrl) {
            return request.continue({
              url: state.images[url].optimizedUrl
            })
          }

          return request.continue({
            optimizedUrl: `${ config.endpoint }/u?url=${ encodeURIComponent(url) }`
          })
        }

        request.continue()
      })

      await delay(ms('1s'))

      // load optimized page
      console.log('Load optimized page')
      console.time('Load optimize page')

      // console.log(Object.keys(state.cache))

      const first = await loadPage(optimizedPage, url)

      console.timeEnd('Load optimize page')
      console.log(first)

      await fs.ensureDir(screenshotDir)

      await optimizedPage.screenshot({
        path: path.join(screenshotDir, `${ identifier }-optimized.jpeg`),
        fullPage: true
      })

      // await delay(ms('1s'))

      // // reload optimized page (respect browser's cache)
      // console.log('Reload optimized page')
      // console.time('Reload optimize page')

      // // await optimizedPage.on('response', (response) => {
      // //   console.log(`${ response.url() } - cache: ${ response.fromCache() }`)
      // // })

      // const second = await loadPage(optimizedPage)

      // console.timeEnd('Reload optimize page')
      // console.log(second)

      // await delay(ms('1s'))

      // console.log('Reload optimized page 2')
      // console.time('Reload optimize page 2')

      // const third = await loadPage(optimizedPage)

      // console.timeEnd('Reload optimize page 2')
      // console.log(third)

    } catch (e) {
      throw e
    } finally {
      await optimizedPage.close()

      console.log('Optimized page closed')
    }
    // summary report


  } catch (e) {
    throw e
  } finally {
    await browser.close()

    console.log('Browser closed')
  }
}
