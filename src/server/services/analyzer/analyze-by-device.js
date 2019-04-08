import fetch from 'node-fetch'
import path from 'path'
import config from 'infrastructure/config'
import adBlocker from 'services/adblock'

import { TYPES } from 'services/report/watcher'

import { loadPage } from './load-page'

export const analyzeByDevice = async (cluster, identifier, url, device, updateProgress) => {
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
        isNavigationRequest: request.isNavigationRequest()
      }

      return request.continue()
    },
    screenshot: path.join(config.screenshotDir, `${ identifier }-${ device }-original.jpeg`)
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

        const optimizedUrl = `${config.optimizerEndpoint}/u?url=${encodeURIComponent(url)}`

        await fetch(optimizedUrl, {
          redirect: 'error',
          timeout: ms('30s')
        })

        image.optimizedUrl = optimizedUrl
      } catch (e) {
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
