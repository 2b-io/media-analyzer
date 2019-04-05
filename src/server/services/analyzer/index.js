import delay from 'delay'
import fs from 'fs-extra'
import lighthouse from 'lighthouse'
import ms from 'ms'
import fetch from 'node-fetch'
import path from 'path'
import DeviceDescriptors from 'puppeteer/DeviceDescriptors'
import { URL } from 'url'

import config from 'infrastructure/config'
import adBlocker from 'services/adblock'

export const analyze = async (cluster, identifier, url) => {
  const mobile = await cluster.execute({ url }, async ({ page, data: { url } }) => {
    const browser = page.browser()
    const wsEndpoint = browser.wsEndpoint()
    const port = (new URL(wsEndpoint)).port

    return await lighthouse(url, {
      port,
      onlyCategories: [ 'performance' ]
    }, {
      // https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/lr-mobile-config.js
      extends: 'lighthouse:default',
      settings: {
        maxWaitForLoad: 35 * 1000,
        // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
        skipAudits: [ 'uses-http2' ]
      },
      audits: [
        'metrics/first-contentful-paint-3g'
      ],
      // @ts-ignore TODO(bckenny): type extended Config where e.g. category.title isn't required
      categories: {
        performance: {
          auditRefs: [
            { id: 'first-contentful-paint-3g', weight: 0 }
          ]
        }
      }
    })
  })

  const desktop = await cluster.execute({ url }, async ({ page, data: { url } }) => {
    const browser = page.browser()
    const wsEndpoint = browser.wsEndpoint()
    const port = (new URL(wsEndpoint)).port

    return await lighthouse(url, {
      port,
      onlyCategories: [ 'performance' ]
    }, {
      // https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/lr-desktop-config.js
      extends: 'lighthouse:default',
      settings: {
        maxWaitForLoad: 35 * 1000,
        emulatedFormFactor: 'desktop',
        throttling: {
          // Using a "broadband" connection type
          // Corresponds to "Dense 4G 25th percentile" in https://docs.google.com/document/d/1Ft1Bnq9-t4jK5egLSOc28IL4TvR-Tt0se_1faTA4KTY/edit#heading=h.bb7nfy2x9e5v
          rttMs: 40,
          throughputKbps: 10 * 1024,
          cpuSlowdownMultiplier: 1
        },
        // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
        skipAudits: [ 'uses-http2' ]
      },
      audits: [
        // 75th and 95th percentiles -> median and PODR
        // SELECT QUANTILES(renderStart, 21) FROM [httparchive:summary_pages.2018_12_15_desktop] LIMIT 1000
        { path: 'metrics/first-contentful-paint', options: { scorePODR: 800, scoreMedian: 1600 } },
        { path: 'metrics/first-meaningful-paint', options: { scorePODR: 800, scoreMedian: 1600 } },
        // 75th and 95th percentiles -> median and PODR
        // SELECT QUANTILES(SpeedIndex, 21) FROM [httparchive:summary_pages.2018_12_15_desktop] LIMIT 1000
        { path: 'metrics/speed-index', options: { scorePODR: 1100, scoreMedian: 2300 } },
        // 75th and 95th percentiles -> median and PODR
        // SELECT QUANTILES(fullyLoaded, 21) FROM [httparchive:summary_pages.2018_12_15_desktop] LIMIT 1000
        { path: 'metrics/interactive', options: { scorePODR: 2000, scoreMedian: 4500 } },
        { path: 'metrics/first-cpu-idle', options: { scorePODR: 2000, scoreMedian: 4500 } }
      ]
    })
  })

  return {
    desktop: {
      lhr: desktop.lhr
    },
    mobile: {
      lhr: mobile.lhr
    }
  }
}

// export const analyze = async (cluster, identifier, url) => {
//   const state = {}

//   const [ mobile, desktop ] = await Promise.all([
//     analyzeByDevice(cluster, identifier, url, 'mobile'),
//     analyzeByDevice(cluster, identifier, url, 'desktop')
//   ])

//   state.mobile = mobile
//   state.desktop = desktop

//   return state
// }

const analyzeByDevice = async (cluster, identifier, url, device) => {
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
    },
    screenshot: path.join(config.screenshotDir, `${ identifier }-${ device }-original.jpeg`)
  })

  console.timeEnd(`Load origin ${device} page`)

  console.time(`Analyze images for ${device}`)

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

  console.timeEnd(`Analyze images for ${device}`)

  console.time(`Load optimized ${device} page`)

  state.optimizedStat = await loadPage({
    cluster,
    page: {
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

  console.timeEnd(`Load optimized ${device} page`)

  return state
}

const loadPage = async ({ cluster, page, requestInterception, screenshot }) => {
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

    if (data.options.isMobile) {
      await page.emulate(DeviceDescriptors['iPhone 8'])
    }

    // begin load page
    await page.goto(data.url, {
      timeout: ms('3m'),
      ...data.options
    })

    if (screenshot) {
      await fs.ensureDir(path.dirname(screenshot))

      await delay(ms('1s'))

      await page.screenshot({
        path: screenshot,
        fullPage: true
      })
    }

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
