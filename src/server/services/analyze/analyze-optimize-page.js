import metrics from 'services/analyze/metrics'
import getImageTag from 'services/analyze/get-image-tag'
import screenshot from 'services/analyze/screenshot'
import redirectedRequest from 'services/analyze/redirected-request'

const analyzeOptimizePage = async (page, params, progress, screenshotDir, index) => {
  const imgTags = await getImageTag(page)

  const pageOptimize = await redirectedRequest(page, imgTags)

  await screenshot(pageOptimize, `${ params.tag }-optimize`, progress, screenshotDir, index)

  await page.goto(params.url, {
    waitUntil: params.mode || 'load',
    timeout: 2 * 60 * 1000 // 2 minutes
  })

  const optimizePageMetric = await metrics(pageOptimize)

  console.log('optimizePageMetric', optimizePageMetric)
}

export default analyzeOptimizePage
