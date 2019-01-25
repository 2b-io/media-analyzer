import metrics from 'services/analyze/metrics'
import screenshot from 'services/analyze/screenshot'

const analyzeOriginPage = async (page, params, progress, screenshotDir, index) => {
  await page.goto(params.url, {
    waitUntil: params.mode || 'load',
    timeout: 2 * 60 * 1000 // 2 minutes
  })

  await screenshot(page, params.tag, progress, screenshotDir, index)

  const originPageMetric = await metrics(page)
  console.log('originPageMetric', originPageMetric)


}

export default analyzeOriginPage
