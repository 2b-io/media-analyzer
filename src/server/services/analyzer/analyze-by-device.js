import delay from 'delay'
import fetch from 'node-fetch'
import path from 'path'
import ms from 'ms'

import config from 'infrastructure/config'
import adBlocker from 'services/adblock'
import normalizeUrl from 'services/normalize-url'
import { TYPES } from 'services/report/watcher'

import { loadPage } from './load-page'

export const analyzeByDevice = async (cluster, identifier, url, optimize, device, updateProgress) => {
  // load desktop page
  const state = {
    images: {}
  }

  updateProgress({
    type: device === 'mobile' ?
      TYPES.LOAD_ORIGINAL_MOBILE :
      TYPES.LOAD_ORIGINAL_DESKTOP,
    message: `Load original ${device} page`
  })

  state.originalStat = await loadPage({
    cluster,
    page: {
      identifier,
      url,
      original: true,
      options: {
        isMobile: device === 'mobile'
      }
    },
    requestInterception: (request) => {
      const url = request.url()
      const resourceType = request.resourceType()

      if (resourceType !== 'image') {
        return request.continue()
      }

      state.images[url] = {
        url,
        isNavigationRequest: request.isNavigationRequest()
      }

      return request.continue()
    },
    screenshot: path.join(config.screenshotDir, `${ identifier }-${ device }-original.jpeg`),
    after: async (page) => {
      const location = await page.evaluate(() => ({
        hostname: location.hostname,
        protocol: location.protocol,
        href: location.href
      }))

      const normalize = normalizeUrl(location.protocol, location.hostname)

      state.url = location.url

      const images = (await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .map(
            (imgTag) => ({
              natural: {
                width: imgTag.naturalWidth,
                height: imgTag.naturalHeight
              },
              displayed: {
                width: imgTag.clientWidth,
                height: imgTag.clientHeight
              },
              src: imgTag.getAttribute('src')
            })
          )
        })
      ).reduce(
        (allImages, image) => {
          if (!image.src) {
            return allImages
          }

          const url = normalize(image.src.trim())

          return {
            ...allImages,
            [url]: image
          }
        }, {}
      )

      // merge image information
      Object.values(state.images).forEach((image) => {
        const { url } = image
        const detail = images[url]

        if (!detail) {
          image.css = true

          return
        }

        image.displayed = detail.displayed
        image.natural = detail.natural
      })
    }
  })

  updateProgress({
    type: device === 'mobile' ?
      TYPES.LOAD_ORIGINAL_MOBILE :
      TYPES.LOAD_ORIGINAL_DESKTOP,
    message: `Load original ${device} page`,
    isCompleted: true,
    data: {
      key: `original.${device}.stat`,
      value: state.originalStat
    }
  })

  updateProgress({
    type: device === 'mobile' ?
      TYPES.OPTIMIZE_IMAGES_MOBILE :
      TYPES.OPTIMIZE_IMAGES_DESKTOP,
    message: `Analyze images for ${device}`
  })

  // get image size here

  await Promise.all(
    Object.entries(state.images).map(async ([ url, image ]) => {
      try {
        if (url.startsWith('data:image')) {
          image.inline = true
          image.skip = true

          return
        }

        if (adBlocker.isAdvertisement(url)) {
          image.block = true
          image.skip = true

          return
        }

        let optimizedUrl

        const shouldResize = image.natural
          && image.displayed
          && image.displayed.width * image.displayed.height > 0
          && image.natural.width * image.natural.height > image.displayed.width * image.displayed.height

        if (optimize) {
          if (shouldResize) {
            optimizedUrl = `${config.optimizerEndpoint}/u?url=${encodeURIComponent(url)}&w=${image.displayed.width}&h=${image.displayed.height}`
          } else {
            optimizedUrl = `${config.optimizerEndpoint}/u?url=${encodeURIComponent(url)}`
          }
        }

        image.optimizedUrl = optimizedUrl
        console.log('image.optimizedUrl', image.optimizedUrl)
        await fetch(optimizedUrl, {
          redirect: 'error',
          timeout: ms('2m')
        })
      } catch (e) {
        console.error(`[${identifier}] Optimize ${image.url} -> ${image.optimizedUrl} failed`, e)

        image.error = true
        image.skip = true
      }
    })
  )

  updateProgress({
    type: device === 'mobile' ?
      TYPES.OPTIMIZE_IMAGES_MOBILE :
      TYPES.OPTIMIZE_IMAGES_DESKTOP,
    message: `Analyze images for ${device}`,
    isCompleted: true,
    data: {
      key: `original.${device}.images`,
      value: state.images
    }
  })

  // wait for cdn propagation
  await delay('2s')

  updateProgress({
    type: device === 'mobile' ?
      TYPES.LOAD_OPTIMIZED_MOBILE :
      TYPES.LOAD_OPTIMIZED_DESKTOP,
    message: `Load optimized ${device} page`
  })

  state.optimizedStat = await loadPage({
    cluster,
    page: {
      identifier,
      url,
      options: {
        isMobile: device === 'mobile'
      }
    },
    requestInterception: (request) => {
      // check redirectChain
      if (request.redirectChain().length) {
        return request.continue()
      }

      const url = request.url()

      const image = state.images[url]

      if (!image || image.error || image.skip || !image.optimizedUrl) {
        return request.continue()
      }

      return request.continue({
        url: image.optimizedUrl
      })
    },
    screenshot: path.join(config.screenshotDir, `${ identifier }-${ device }-optimized.jpeg`)
  })

  updateProgress({
    type: device === 'mobile' ?
      TYPES.LOAD_OPTIMIZED_MOBILE :
      TYPES.LOAD_OPTIMIZED_DESKTOP,
    message: `Load optimized ${device} page`,
    isCompleted: true,

    data: {
      key: `optimized.${device}.stat`,
      value: state.optimizedStat
    }
  })

  return state
}
