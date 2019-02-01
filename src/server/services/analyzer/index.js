import delay from 'delay'
import fs from 'fs-extra'
import ms from 'ms'
import fetch from 'node-fetch'
import path from 'path'
import puppeteer from 'puppeteer'

import config from 'infrastructure/config'
import reportService from 'services/report'

// load page & collect downloadedBytes and loadTime
const loadPage = async (page, params = {}) => {
  const {
    url,
    screenshot,
    width = 1440,
    height = 900,
    mode = 'load',
    timeout = '5m'
  } = params

  // await page._client.send('Performance.enable')
  await page.setViewport({
    width,
    height
  })

  const resources = {}

  page._client.on('Network.dataReceived', (event) => {
    const req = page._networkManager._requestIdToRequest.get(event.requestId)

    if (!req) {
      return
    }

    const url = req.url()

    if (url.startsWith('data:')) {
      return
    }

    const length = event.dataLength

    if (!resources[url]) {
      resources[url] = { size: 0 }
    }

    resources[url].size += length
  })

  if (url) {
    await page.goto(url, {
      waitUntil: mode,
      timeout: ms(timeout)
    })
  } else {
    await page.reload({
      waitUntil: mode,
      timeout: timeout
    })
  }

  if (screenshot) {
    await fs.ensureDir(path.dirname(screenshot))

    await delay(ms('1s'))

    await page.screenshot({
      path: screenshot,
      fullPage: true
    })
  }

  const performance = JSON.parse(await page.evaluate(
    () => JSON.stringify(window.performance)
  ))

  const latestTiming = Object.entries(performance.timing).reduce(
    (max, [ key, value ]) => max.value > value ? max : { key, value }, { value: 0 }
  )

  const downloadedBytes = Object.values(resources).reduce(
    (sum, { size }) => sum + (size || 0), 0
  )

  const timeToFirstByte = performance.timing.responseStart - performance.timing.requestStart
  const request = performance.timing.requestStart - performance.timing.connectEnd
  const response = performance.timing.responseEnd - performance.timing.responseStart
  const processing = performance.timing.loadEventStart - performance.timing.domLoading

  // refer
  // https://marketing.adobe.com/resources/help/en_US/sc/implement/performanceTiming.html
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API

  return {
    loadTime: latestTiming.value - performance.timing.navigationStart,
    timeToFirstByte,
    request,
    response,
    processing,
    downloadedBytes
  }
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
    timeout
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
      await reportService.updateProgress(identifier, 'Load origin page...')
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

      const result = await loadPage(originPage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-original.jpeg`)
      })

      await reportService.updateProgress(identifier, 'Load origin page... done')

      console.timeEnd('Load origin page')

      console.log(result)

      const location = await originPage.evaluate(() => ({
        hostname: location.hostname,
        protocol: location.protocol,
        href: location.href
      }))

      const normalize = normalizeUrl(location.protocol, location.hostname)

      state.url = location.href
      state.original = result

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

      // index imgTags
      const imagesInHTML = imgTags.reduce(
        (all, img) => {
          if (!img.src) {
            return all
          }

          const url = normalize(img.src.trim())

          return {
            ...all,
            [url]: img
          }
        },
        {}
      )

      // populate optimize urls
      Object.values(state.images).forEach((image) => {
        const url = image.url

        const img = imagesInHTML[url] || {}

        const { displayed } = img

        state.images[url] = {
          ...state.images[url],
          ...img,
          optimizedUrl: displayed ?
            `${ config.optimizerEndpoint }/u?url=${ encodeURIComponent(url) }&w=${ displayed.width }&h=${ displayed.height }` :
            `${ config.optimizerEndpoint }/u?url=${ encodeURIComponent(url) }`
        }
      })
    } catch (e) {
      throw e
    } finally {
      await originPage.close()

      console.log('Origin page closed')
    }

    // warm up optimized content
    console.time('Warm up cache')

    await reportService.updateProgress(identifier, 'Warm up cache...')

    try {
      await Promise.all(
        Object.values(state.images).map(
          ({ optimizedUrl }) => fetch(optimizedUrl)
        )
      )
    } catch (e) {
      // skip
    } finally {
      console.timeEnd('Warm up cache')

      await reportService.updateProgress(identifier, 'Warm up cache... done')
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

      // load optimized page
      console.log('Load optimized page')
      console.time('Load optimize page')

      await reportService.updateProgress(identifier, 'Load optimized page...')

      const result = await loadPage(optimizedPage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-optimized.jpeg`)
      })

      console.timeEnd('Load optimize page')

      await reportService.updateProgress(identifier, 'Load optimized page... done')

      console.log(result)

      state.optimized = result
    } catch (e) {
      throw e
    } finally {
      await optimizedPage.close()

      console.log('Optimized page closed')
    }
    // summary report

    await reportService.update(identifier, {
      original: state.original,
      optimized: state.optimized,
      url: state.url,
      finish: true
    })

    await reportService.updateProgress(identifier, 'Finished!')
  } catch (e) {
    throw e
  } finally {
    await browser.close()

    console.log('Browser closed')
  }
}
