import fetch from 'node-fetch'
import path from 'path'

import config from 'infrastructure/config'
import initBrowser from 'services/analyzer/init-browser'
import loadPage from 'services/analyzer/load-page'
import normalizeUrl from 'services/analyzer/normalize-url'
import setRequestImage from 'services/analyzer/set-request-image'

import reportService from 'services/report'

const launchPuppeteer = async (params, userAgent) => {
  const {
    url,
    identifier,
    timeout
  } = params

  const isMobile = userAgent === 'mobile' ? true : false

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
      await reportService.updateProgress(identifier, `Load origin ${ userAgent } page...`)
      console.log(`Load origin ${ userAgent } page`)
      console.time(`Load origin ${ userAgent } page`)

      // set request interception
      await originPage.setRequestInterception(true)

      originPage.on('request', (request) => {
        if (!state.inspect && request.resourceType() === 'image') {
          const url = request.url()

          state.images[ url ] = { url }
        }

        request.continue()
      })

      const result = await loadPage(originPage, {
        url,
        isMobile,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-${ userAgent }-original.jpeg`),
        harName: path.join(config.harDir, `${ identifier }-${ userAgent }-original.har`)
      })

      await reportService.updateProgress(identifier, `Load origin ${ userAgent } page... done`)

      console.timeEnd(`Load origin ${ userAgent } page`)

      console.log(result)

      const location = await originPage.evaluate(() => ({
        hostname: location.hostname,
        protocol: location.protocol,
        href: location.href
      }))

      const normalize = normalizeUrl(location.protocol, location.hostname)

      state.url = location.href

      await reportService.update(identifier, {
        url: state.url,
        $set: { [ `${ userAgent }.original` ]: result }
      })
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
            [ url ]: img
          }
        },
        {}
      )

      // populate optimize urls
      Object.values(state.images).forEach((image) => {
        const url = image.url

        const img = imagesInHTML[ url ] || {}

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

      console.log(`Origin ${ userAgent } page closed`)
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
      setRequestImage(optimizedPage, state.images)

      // load optimized page
      console.log(`Load optimized ${ userAgent } page`)
      console.time(`Load optimized ${ userAgent } page`)

      await reportService.updateProgress(identifier, `Load optimized ${ userAgent } page...`)

      const result = await loadPage(optimizedPage, {
        url,
        isMobile,
        timeout,
        screenshot: path.join(config.screenshotDir, `${ identifier }-${ userAgent }-optimized.jpeg`),
        harName: path.join(config.harDir, `${ identifier }-${ userAgent }-optimized.har`)
      })

      console.timeEnd(`Load optimized ${ userAgent } page`)

      await reportService.updateProgress(identifier, `Load optimized ${ userAgent } page... done`)

      console.log(result)

      await reportService.update(identifier, {
        $set: { [ `${ userAgent }.optimized` ]: result }
      })
    } catch (e) {
      throw e
    } finally {
      await optimizedPage.close()

      console.log(`Optimized ${ userAgent } page closed`)
    }
  } catch (e) {
    console.log('e', e)
    throw e
  } finally {

    await browser.close()
    console.log('Browser closed')
  }
}

export default launchPuppeteer
