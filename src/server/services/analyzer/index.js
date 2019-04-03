import ms from 'ms'
import fetch from 'node-fetch'

import config from 'infrastructure/config'
import adBlocker from 'services/adblock'

export const analyze = async (cluster, url) => {
  const state = {}

  const [ mobile, desktop ] = await Promise.all([
    analyzeByDevice(cluster, url, 'mobile'),
    analyzeByDevice(cluster, url, 'desktop')
  ])

  state.mobile = mobile
  state.desktop = desktop

  return state
}

const analyzeByDevice = async (cluster, url, device) => {
  // load desktop page
  const state = {
    images: {}
  }

  console.time(`Load origin ${device} page`)

  state.originalStat = await loadPage({
    cluster,
    page: {
      url,
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
    }
  })

  console.timeEnd(`Load origin ${device} page`)

  console.time(`Filter images for ${device}`)

  await Promise.all(
    Object.entries(state.images).map(async ([ url, image ]) => {
      try {
        if (url.startsWith('data:image')) {
          console.log('inline image')

          image.inline = true
          image.skip = true

          return
        }

        if (adBlocker.isAdvertisement(url)) {
          console.log(`[adblock] ${url}`)

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

  console.timeEnd(`Filter images for ${device}`)

  console.time(`Load optimized ${device} page`)

  state.optimizedStat = await loadPage({
    cluster,
    page: {
      url
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
    }
  })

  console.timeEnd(`Load optimized ${device} page`)

  return state
}

const loadPage = async ({ cluster, page, requestInterception }) => {
  return await cluster.execute(page, async ({ page, data }) => {
    const resources = {}

    // init event handlers
    await page.setRequestInterception(true)
    await page.on('request', requestInterception)
    await page._client.on('Network.dataReceived', (event) => {
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

    // begin load page
    await page.goto(data.url, {
      timeout: ms('2m'),
      ...data.options
    })

    // extract useful metrics
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

    return {
      loadTime: latestTiming.value - performance.timing.navigationStart,
      timeToFirstByte,
      request,
      response,
      processing,
      downloadedBytes
    }
  })
}
