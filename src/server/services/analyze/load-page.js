import metrics from 'services/analyze/metrics'
import screenshot from 'services/analyze/screenshot'

const loadPage = async (page, params, progress, screenshotDir, screenshotIndex) => {
  progress(`[${params.mode}] GET ${params.url} ...`)

  await page.goto(params.url, {
    waitUntil: params.mode || 'load',
    timeout: 2 * 60 * 1000 // 2 minutes
  })

  await screenshot(page, `${ params.tag }-optimize`, progress, screenshotDir, screenshotIndex)

  return await metrics(page)
}

export default loadPage
