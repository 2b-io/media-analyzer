import boolean from 'boolean'
import mimeMatch from 'mime-match'
import mkdirp from 'mkdirp'
import path from 'path'
import pretty from 'pretty-bytes'
import puppeteer from 'puppeteer'

import normalizeUrl from 'services/normalize-url'
import implement from 'services/implement-page'
import optimize from 'services/optimize'
import reportService from 'services/report'
import timingMetrics from 'services/timing-metrics'

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'

const screenshotDir = path.join(__dirname, '../../../screenshot')
const pageContentDir = path.join(__dirname, '../../../page-content')
mkdirp.sync(screenshotDir)

const analyze = async (data, progress) => {
  const { tag:reportTag, url } = data

  progress(`Analyze tag: ${reportTag}`)

  const report = await reportService.get(reportTag)

  // if (report && report.created + (5 * 60e3) > Date.now()) {
  //   progress('Cache hit')

  //   return `/reports/${reportTag}`
  // }

  const viewport = {
    // width: 375,
    width: parseInt(data.w || 1280, 10),
    height: parseInt(data.h || 900, 10),
    isMobile: boolean(data.mobile)
  }

  const ua = boolean(data.mobile) ? MOBILE_UA : DESKTOP_UA

  // collector
  const resources = {}

  progress(`[${data.mode}] GET ${url} ...`)

  let browser

  try {
    browser = await puppeteer.launch({
      // headless: f,
      args: [ '--no-sandbox', '--disable-dev-shm-usage' ],
      ignoreHTTPSErrors: true
    })

    const page = await browser.newPage()

    // config headless-chrome-page
    await page.setViewport(viewport)
    await page.setUserAgent(ua)

    await page._client.on('Network.dataReceived', async (event) => {
      const req = page._networkManager._requestIdToRequest.get(event.requestId)

      if (!req) {
        return
      }

      const url = req.url()

      if (url.startsWith('data:')) {
        return
      }

      const length = event.dataLength

      if (!(url in resources)) {
        resources[url] = { url }
      }

      resources[url].size = (resources[url].size || 0) + length
    })

    await page.on('response', async (res) => {
      const req = res.request()

      const url = req.url()

      if (url.startsWith('data:')) {
        return
      }

      if (!(url in resources)) {
        resources[url] = { url }
      }

      resources[url].status = res.status()
      resources[url].contentType = (res.headers()['content-type'] || '')
        .split(';').shift()
    })

    const response = await page.goto(url, {
      waitUntil: data.mode || 'load',
      timeout: 2 * 60 * 1000 // 2 minutes
    })

    progress(`[${data.mode}] GET ${url}... ${response.status()}`, true)

    progress(`Capture screenshot...`)

    const screenshot = `${reportTag}.jpeg`

    await page.screenshot({
      path: path.join(screenshotDir, screenshot),
      fullPage: true,
      type: 'jpeg',
      quality: 50
    })

    progress('Capture screenshot... done', true)

    progress(`Inspect DOM...`)

    // get protocol & hostname from actual webpage, results of any redirects
    const location = await page.evaluate(() => ({
      hostname: location.hostname,
      protocol: location.protocol
    }))

    const normalize = normalizeUrl(location.protocol, location.hostname)

    const html = await page.evaluate(() => {
      return document.querySelector('html').innerHTML
    })

    // get size of displayed images (<img />)
    const imgTags = (
      await page.evaluate(() => {
        const imgs = document.querySelectorAll('img')

        return [].slice.call(imgs).map((img) => {
          return {
            natural:{
              width: img.naturalWidth,
              height: img.naturalHeight
            },
            displayed: {
              width: img.clientWidth,
              height: img.clientHeight
            },
            src: img.getAttribute('src')
          }
        })
      })
    )
    .filter(Boolean)
    .filter(img => {
      return img.src && img.natural.width > 0 && img.natural.height > 0 && img.displayed.width > 0 && img.displayed.height > 0
    })
    .map(img => ({
      ...img,
      shouldResize: (img.natural.width * img.natural.height) > (img.displayed.width * img.displayed.height),
      url: normalize(img.src.trim())
    }))
    .reduce((tags, img) => {
      const { url } = img
      const existed = tags[url]

      if (!existed) {
        tags[url] = img
      } else {
        if ((img.displayed.width * img.displayed.height) > (existed.displayed.width * existed.displayed.height)) {
          tags[url] = img
        }
      }

      return tags
    }, {})

    // find image from all received resources
    const images = Object.values(resources).reduce((images, resource) => {
      const { url, contentType }  = resource

      if (mimeMatch(contentType, 'image/*')) {
        images[url] = {
          ...resource,
          prettySize: pretty(resource.size || 0),
          imgTag: imgTags[url],
          css: !(url in imgTags),
          percent: 100
        }
      }

      return images
    }, {})

    progress(`Inspect DOM... done`, true)

    progress(`Optimize...`)

    const imgs = await optimize(Object.values(images))

    progress(`Optimize... done`, true)

    // do some summary
    const totalSize = imgs.reduce((size, imgs) => size + (imgs.size || 0), 0)
    const totalOptimizedSize = imgs.reduce((size, imgs) => size + (imgs.optimizedSize || 0), 0)

    imgs.forEach(img => {
      img.percent = img.size ?
        (img.optimizedSize / img.size) * 100 : 100
    })

    await reportService.set(reportTag, {
      // resources,
      imgs,
      url: url,
      screenshot: `/s/${screenshot}`,
      prettyTotalSize: pretty(totalSize || 0),
      prettyTotalOptimizedSize: pretty(totalOptimizedSize || 0),
      percent: totalSize ?
       (totalOptimizedSize / totalSize) * 100 : 100,
      created: Date.now()
    })

    const rawMetrics = await page.evaluate(() => {
      return JSON.stringify(window.performance.timing)
    })

    const metrics = JSON.parse(rawMetrics)

    const { fullTimeLoad: fullTimeLoadOriginPage } = timingMetrics(metrics)
    console.log('Result load origin page', fullTimeLoadOriginPage)

    await implement(html, reportTag, normalize)

    await page.goto(`file://${ pageContentDir }/${ reportTag }.html`)

    const rawMetricsOptimize = await page.evaluate(() => {
      return JSON.stringify(window.performance.timing)
    })

    const metricsOptimize = JSON.parse(rawMetricsOptimize)

    const { htmlLoadTime, fullTimeLoad: fullTimeLoadOptimizePage } = timingMetrics(metricsOptimize)
    console.log('Result load optimize page', htmlLoadTime + fullTimeLoadOptimizePage)

    return `/reports/${reportTag}`
  } finally {
    if (browser) {
      progress(`Close browser...`)

      await browser.close()

      progress(`Close browser... done`, true)
    }
  }
}

export default analyze
