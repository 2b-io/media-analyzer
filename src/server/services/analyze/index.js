import mkdirp from 'mkdirp'
import path from 'path'

import getImageTag from 'services/analyze/get-image-tag'
import initBrowser from 'services/analyze/init-browser'
import initPage from 'services/analyze/init-page'
import intepreceptionRequest from 'services/analyze/intepreception-request'
import metrics from 'services/analyze/metrics'
import loadPage from 'services/analyze/load-page'
import receivedData from 'services/analyze/received-data'
import responsePage from 'services/analyze/response-page'
import screenshot from 'services/analyze/screenshot'

import report from 'services/report'

const LOAD_PAGE_NUMBER = 3
const screenshotDir = path.join(__dirname, '../../../../screenshot')
mkdirp.sync(screenshotDir)

const analyze = async (params, progress) => {
  const { identifier, url } = params
  // progress(`Analyze tag: ${reportTag}`)

  const browser = await initBrowser()

  // report.updateProgress(tag, 'Loading page ...')

  let originImgTags

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    const originPage = await initPage(browser, params)

    console.log('Init origin page ...')

    await report.create(identifier)
    await report.updateProgress(identifier, 'Init page origin ...')

    const originData = await receivedData(originPage)

    const originResources = await responsePage(originPage, originData)

    await loadPage(originPage, params, progress)

    console.log('Load page origin...')
    await report.updateProgress(identifier, 'Loading origin ...')

    const originPageSize = Object.values(originResources)
      .map(({ size }) => size || 0)
      .reduce((sum, size) => sum + size, 0)

    console.log('Calculate size page origin', originPageSize)

    await report.updateProgress(identifier, 'Calculate size page origin ...')

    const originScreenshotPath = await screenshot(originPage, `${ identifier }-origin`, progress, screenshotDir, i)

    const originMetrics = await metrics(originPage)

    if (i === 0) {
      originImgTags = await getImageTag(originPage)
    }

    const originReport = {
      originScreenshotPath
    }

    originReport[ `originMetrics-${ i }` ] = originMetrics

    await report.updateProgress(identifier, 'analyze page origin done ...')

    await report.updateReportOriginPage(identifier, originReport)

    await originPage.close()
  }

//page optimize
  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    const newPage = await initPage(browser, params)
    console.log('Init optimize page ... ')
    await report.updateProgress(identifier, 'Init page optimize ...')

    const optimizeData = await receivedData(newPage)

    const optimizeResources = await responsePage(newPage, optimizeData)

    const optimizePage = await intepreceptionRequest(newPage, originImgTags)

    await loadPage(optimizePage, params, progress, screenshotDir, i)

    console.log('Load page optimize ....')
    await report.updateProgress(identifier, 'Load page optimize ...')

    const optimizePageSize = Object.values(optimizeResources)
      .map(({ size }) => size || 0)
      .reduce((sum, size) => sum + size, 0)

    const optimizeScreenshotPath = await screenshot(optimizePage, `${ identifier }-optimize`, progress, screenshotDir, i)

    const optimizeMetrics = await metrics(optimizePage, optimizePageSize)
    console.log('Calculate size page optimize', optimizePageSize)
    await report.updateProgress(identifier, 'Calculate size page optimize ...')

    const optimizeReport = {
      optimizeScreenshotPath
    }

    optimizeReport[ `optimizeMetrics-${ i }` ] = optimizeMetrics

    await report.updateReportOptimizePage(identifier, optimizeReport)

    await optimizePage.close()
  }

  console.log('Close browser...')

  // progress(`Close browser...`)

  await report.updateProgress(identifier, 'analyze page optimize done ...')

  await browser.close()
  // progress(`Close browser... done`, true
}

export default analyze
