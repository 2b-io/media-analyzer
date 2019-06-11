import lighthouse from 'lighthouse'
import { URL } from 'url'

import { TYPES } from 'services/report/watcher'
import formatDataLighthouse from './lighthouse/format-data'

export const runLighthouse = async (cluster, identifier, url, updateProgress) => {
  updateProgress({
    message: 'Run lighthouse for mobile site'
  })

  const mobile = await cluster.execute({
    type: TYPES.RUN_LIGHTHOUSE_MOBILE,
    url: `${url}#lighthouse/mobile/${identifier}`
  }, async ({ page, data }) => {
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

  updateProgress({
    type: TYPES.RUN_LIGHTHOUSE_MOBILE,
    message: 'Run lighthouse for mobile site',
    isCompleted: true,
    data: {
      key: 'lighthouse.mobile',
      value: formatDataLighthouse(mobile.lhr)
    }
  })

  updateProgress({
    type: TYPES.RUN_LIGHTHOUSE_DESKTOP,
    message: 'Run lighthouse for desktop site'
  })

  const desktop = await cluster.execute({
    url: `${url}#lighthouse/desktop/${identifier}`
  }, async ({ page, data }) => {
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

  updateProgress({
    type: TYPES.RUN_LIGHTHOUSE_DESKTOP,
    message: 'Run lighthouse for desktop site',
    isCompleted: true,
    data: {
      key: 'lighthouse.desktop',
      value: formatDataLighthouse(desktop.lhr)
    }
  })

  return {
    desktop: {
      lhr: formatDataLighthouse(desktop.lhr)
    },
    mobile: {
      lhr: formatDataLighthouse(mobile.lhr)
    }
  }
}
