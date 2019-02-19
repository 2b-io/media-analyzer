import delay from 'delay'
import devices from 'puppeteer/DeviceDescriptors'
import fs from 'fs-extra'
import ms from 'ms'
import path from 'path'

const loadPage = async (page, params = {}) => {
  const {
    url,
    screenshot,
    width = 1440,
    height = 900,
    mode = 'load',
    timeout = '5m',
    isMobile = false
  } = params

  // await page._client.send('Performance.enable')
  await page.setCacheEnabled(false)
  await page.setViewport({
    width,
    height,
    isMobile,
  })

  const resources = {}

  page._client.on('Network.dataReceived', (event) => {
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

  if (url) {
    if (isMobile) {
      const iPhone = devices['iPhone 8']
      await page.emulate(iPhone)
    }

    await page.goto(url, {
      waitUntil: mode,
      timeout: ms(timeout)
    })
  } else {
    await page.reload({
      waitUntil: mode,
      timeout: timeout
    })
  }

  if (screenshot) {
    await fs.ensureDir(path.dirname(screenshot))

    await delay(ms('1s'))

    await page.screenshot({
      path: screenshot
      // fullPage: true
    })
  }

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

  // refer
  // https://marketing.adobe.com/resources/help/en_US/sc/implement/performanceTiming.html
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API

  return {
    loadTime: latestTiming.value - performance.timing.navigationStart,
    timeToFirstByte,
    request,
    response,
    processing,
    downloadedBytes
  }
}

export default loadPage
