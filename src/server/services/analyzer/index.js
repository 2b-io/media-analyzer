import delay from 'delay'
import fs from 'fs-extra'
import ms from 'ms'
import fetch from 'node-fetch'
import path from 'path'
import puppeteer from 'puppeteer'

import config from 'infrastructure/config'
import googlePageSpeedService from 'services/google-page-speed'
import reportService from 'services/report'

// load page & collect downloadedBytes and loadTime
const setRequestImage = (page, images) => {
  page.on('request', async (request) => {
    const url = request.url()

    if (request.resourceType() === 'image') {
      if (images[url] && images[url].optimizedUrl) {
        return request.continue({
          url: images[url].optimizedUrl
        })
      }

      return request.continue({
        optimizedUrl: `${ config.endpoint }/u?url=${ encodeURIComponent(url) }`
      })
    }

    request.continue()
  })
}
const loadPage = async (page, params = {}) => {
  const {
    url,
    screenshot,
    width = 1440,
    height = 900,
    mode = 'load',
    timeout = '5m',
    isMobile = false
  } = params

  // await page._client.send('Performance.enable')
  await page.setViewport({
    width,
    height,
    isMobile
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
    const originDesktopPage = await incognitoContext.newPage()

    try {
      // load origin page
      await reportService.updateProgress(identifier, 'Load origin desktop page...')
      console.log('Load origin desktop page')
      console.time('Load origin desktop page')

      // set request interception
      await originDesktopPage.setRequestInterception(true)

      originDesktopPage.on('request', (request) => {
        if (!state.inspect && request.resourceType() === 'image') {
          const url = request.url()

          state.images[url] = { url }
        }

        request.continue()
      })

      const result = await loadPage(originDesktopPage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-desktop-original.jpeg`)
      })

      await reportService.updateProgress(identifier, 'Load origin desktop page... done')

      console.timeEnd('Load origin desktop page')

      console.log(result)

      const location = await originDesktopPage.evaluate(() => ({
        hostname: location.hostname,
        protocol: location.protocol,
        href: location.href
      }))

      const normalize = normalizeUrl(location.protocol, location.hostname)

      state.url = location.href
      state.desktopOriginal = result

      // collection <img> tags
      const imgTags = await originDesktopPage.evaluate(() => {
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
      await originDesktopPage.close()

      console.log('Origin desktop page closed')
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

    const optimizedDesktopPage = await incognitoContext.newPage()

    try {
      // add request interception
      await optimizedDesktopPage.setRequestInterception(true)

      // handle requests
      setRequestImage(optimizedDesktopPage, state.images)

      // load optimized page
      console.log('Load optimized desktop page')
      console.time('Load optimize desktop page')

      await reportService.updateProgress(identifier, 'Load optimized desktop page...')

      const result = await loadPage(optimizedDesktopPage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-desktop-optimized.jpeg`)
      })

      console.timeEnd('Load optimize desktop page')

      await reportService.updateProgress(identifier, 'Load optimized desktop page... done')

      console.log(result)

      state.desktopOtimized = result
    } catch (e) {
      throw e
    } finally {
      await optimizedDesktopPage.close()

      console.log('Optimized desktop page closed')
    }

    const originalMobilePage = await incognitoContext.newPage()

    try {
      await reportService.updateProgress(identifier, 'Load origin mobile page...')
      console.log('Load origin mobile page')
      console.time('Load origin mobile page')

      await originalMobilePage.setRequestInterception(true)

      originalMobilePage.on('request', (request) => {
        request.continue()
      })

      const originalMobileResult = await loadPage(originalMobilePage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-mobile-original.jpeg`),
        isMobile: true
      })

      await reportService.updateProgress(identifier, 'Load origin mobile page... done')

      console.timeEnd('Load origin mobile page')

      console.log(originalMobileResult)

      state.mobileOriginal = originalMobileResult
    } catch (e) {
      throw e
    } finally {
      await originalMobilePage.close()
    }

    const optimizedMobilePage = await incognitoContext.newPage()

    try {
      await optimizedMobilePage.setRequestInterception(true)

      setRequestImage(optimizedMobilePage, state.images)

      // load mobile optimized page
      console.log('Load optimized mobile page')
      console.time('Load optimize mobile page')
      await reportService.updateProgress(identifier, 'Load optimized mobile page...')

      const resultMobileOtimized = await loadPage(optimizedMobilePage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-mobile-optimized.jpeg`),
        isMobile: true
      })

      console.timeEnd('Load optimize mobile page')

      await reportService.updateProgress(identifier, 'Load optimized mobile page... done')

      console.log(resultMobileOtimized)

      state.mobileOptimized = resultMobileOtimized

    } catch (e) {
      throw e
    } finally {
      await optimizedMobilePage.close()

      console.log('Optimized mobile page closed')
    }

    await reportService.updateProgress(identifier, 'Google page speed test desktop mode...')

    const googlePageSpeedDesktopData = await googlePageSpeedService(
      url,
      { strategy: 'desktop' }
    )

    await reportService.updateProgress(identifier, 'Google page speed test desktop done')

    const {
      lighthouseResult: {
        categories: {
          performance: {
            score: desktopScore
          }
        }
      }
    } = googlePageSpeedDesktopData

    // summary report

    await reportService.update(identifier, {
      desktop: {
        original: state.desktopOriginal,
        optimized: state.desktopOtimized,
        url: state.url,
        originalLighthouseData: googlePageSpeedDesktopData,
        originalPerformanceScore: desktopScore * 100,
        optimizePerformanceScore: Math.ceil((100 - desktopScore) / 2 + desktopScore),
      }
    })

    await reportService.updateProgress(identifier, 'Google page speed test mobile mode...')

    const googlePageSpeedMobileData = await googlePageSpeedService(
      url,
      { strategy: 'mobile' }
    )

    const {
      lighthouseResult: {
        categories: {
          performance: {
            score: mobileScore
          }
        }
      }
    } = googlePageSpeedMobileData

    await reportService.updateProgress(identifier, 'Google page speed test mobile done')

    await reportService.update(identifier, {
      mobile: {
        original: state.mobileOriginal,
        optimized: state.mobileOptimized,
        originalLighthouseData: googlePageSpeedMobileData,
        originalPerformanceScore: mobileScore * 100,
        optimizePerformanceScore: Math.ceil((100 - mobileScore) / 2 + mobileScore),
      },
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
