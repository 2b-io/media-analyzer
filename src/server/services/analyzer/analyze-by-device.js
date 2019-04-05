import fetch from 'node-fetch'
import path from 'path'
import config from 'infrastructure/config'
import adBlocker from 'services/adblock'

import { loadPage } from './load-page'

export const analyzeByDevice = async (cluster, identifier, url, device, notify) => {
  // load desktop page
  const state = {
    images: {}
  }

  notify(`Load original ${device} page`)

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

  notify(`Load original ${device} page`, true)

  notify(`Analyze images for ${device}`)

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
          redirect: 'error'
        })

        image.optimizedUrl = optimizedUrl
      } catch (e) {
        image.error = true
        image.skip = true
      }
    })
  )

  notify(`Analyze images for ${device}`, true)

  notify(`Load optimized ${device} page`)

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

  notify(`Load optimized ${device} page`, true)

  return state
}
