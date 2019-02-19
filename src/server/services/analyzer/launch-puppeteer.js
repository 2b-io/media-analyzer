import fetch from 'node-fetch'
import puppeteer from 'puppeteer'
import path from 'path'

import config from 'infrastructure/config'
import loadPage from 'services/analyzer/load-page'
import normalizeUrl from 'services/analyzer/normalize-url'
import setRequestImage from 'services/analyzer/set-request-image'

import reportService from 'services/report'

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
      '--proxy-bypass-list=*',
      '--enable-features=NetworkService'
    ],
    ignoreHTTPSErrors: true
  })

  return browser
}

const launchPuppeteer = async (params) => {
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
        screenshot: path.join(config.screenshotDir, `${ identifier }-desktop-original.jpeg`),
        harName: path.join(config.harDir, `${ identifier }-desktop-original.har`)
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

      await reportService.update(identifier, {
        url: state.url,
        desktopOriginalData: state.desktopOriginal
      })
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
      console.time('Load optimized desktop page')

      await reportService.updateProgress(identifier, 'Load optimized desktop page...')

      const result = await loadPage(optimizedDesktopPage, {
        url,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-desktop-optimized.jpeg`),
        harName: path.join(config.harDir, `${ identifier }-desktop-optimized.har`)
      })

      console.timeEnd('Load optimized desktop page')

      await reportService.updateProgress(identifier, 'Load optimized desktop page... done')

      console.log(result)

      state.desktopOtimized = result

      await reportService.update(identifier, {
        desktopOptimizedData: state.desktopOtimized
      })
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
        isMobile: true,
        harName: path.join(config.harDir, `${ identifier }-mobile-original.har`)
      })

      await reportService.updateProgress(identifier, 'Load origin mobile page... done')

      console.timeEnd('Load origin mobile page')

      console.log(originalMobileResult)

      state.mobileOriginal = originalMobileResult

      await reportService.update(identifier, {
        mobileOriginalData: state.mobileOriginal
      })
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
        isMobile: true,
        harName: path.join(config.harDir, `${ identifier }-mobile-optimized.har`)
      })

      console.timeEnd('Load optimize mobile page')

      await reportService.updateProgress(identifier, 'Load optimized mobile page... done')

      console.log(resultMobileOtimized)

      state.mobileOptimized = resultMobileOtimized

      await reportService.update(identifier, {
        mobileOptimizedData: state.mobileOptimized
      })
    } catch (e) {
      throw e
    } finally {
      await optimizedMobilePage.close()

      console.log('Optimized mobile page closed')
    }
  } catch (e) {
    throw e
  } finally {
    await browser.close()

    console.log('Browser closed')
  }
}

export default launchPuppeteer
