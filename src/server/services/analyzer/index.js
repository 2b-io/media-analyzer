import ms from 'ms'
import puppeteer from 'puppeteer'

import config from 'infrastructure/config'

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
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ],
    ignoreHTTPSErrors: true
  })

  return browser
}

export const analyze = async (params) => {
  const { url, identifier, mode = 'networkidle2' } = params
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

      await originPage.goto(url, {
        waitUntil: mode,
        timeout: ms('5m')
      })

      console.timeEnd('Load origin page')

      state.inspect = true

      const location = await originPage.evaluate(() => ({
        hostname: location.hostname,
        protocol: location.protocol
      }))

      const normalize = normalizeUrl(location.protocol, location.hostname)

      // collection <img> tags
      const imgTag = await originPage.evaluate(() => {
        const tags = document.querySelectorAll('img')

        return Array.from(tags).map(
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

      imgTag.forEach((image) => {
        const url = normalize(image.src)

        state.images[url] = {
          ...state.images[url],
          ...image
        }
      })

      console.log(state.images)

      return

      // reload origin page (respect browser's cache)
      console.log('Reload origin page')
      console.time('Reload origin page')

      await originPage.reload({
        waitUntil: mode,
        timeout: ms('5m')
      })

      console.timeEnd('Reload origin page')

    } catch (e) {
      throw e
    } finally {
      await originPage.close()
    }

    // warm up optimized content

    const optimizedPage = await incognitoContext.newPage()

    try {
      // add request interception
      await optimizedPage.setRequestInterception(true)

      // handle requests
      optimizedPage.on('request', (request) => {
        if (request.resourceType() === 'image') {
          const url = request.url()

          if (state.images[url]) {
            if (state.images[url].optimizedUrl) {
              // console.log('Abort url', url)

              return request.abort()
            }

            const { displayed } = state.images[url]

            state.images[url].optimizedUrl = `${ config.endpoint }/u?url=${ encodeURIComponent(url) }&w=${ displayed.width }&h=${  displayed.height }`
          } else {
            state.images[url] = {
              src: url,
              css: true,
              optimizedUrl: `${ config.endpoint }/u?url=${ encodeURIComponent(url) }`
            }
          }

          return request.continue({
            url: state.images[url].optimizedUrl
          })
        }

        request.continue()
      })

      // load optimized page
      console.log('Load optimized page')
      console.time('Load optimize page')

      await optimizedPage.goto(url, {
        waitUntil: mode,
        timeout: ms('5m')
      })

      console.timeEnd('Load optimize page')

      // reload optimized page (respect browser's cache)
      console.log('Reload optimized page')
      console.time('Reload optimize page')

      await optimizedPage.reload(url, {
        waitUntil: mode,
        timeout: ms('5m')
      })

      console.timeEnd('Reload optimize page')

    } catch (e) {
      throw e
    } finally {
      await optimizedPage.close()
    }
    // summary report


  } catch (e) {
    throw e
  } finally {
    console.log('Browser close')

    await browser.close()
  }
}
