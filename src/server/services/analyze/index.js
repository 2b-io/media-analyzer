import mkdirp from 'mkdirp'
import path from 'path'
import shortHash from 'shorthash'

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
  const { tag: reportTag, url } = params
  // create Report

  // progress(`Analyze tag: ${reportTag}`)

  const browser = await initBrowser()

  // page origin
  console.log('Init origin page ... ')
  // report.updateProgress(tag, 'Loading page ...')

  let originImgTags

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    const originPage = await initPage(browser, params)

    const originData = await receivedData(originPage)

    const originResources = await responsePage(originPage, originData)

    await loadPage(originPage, params, progress)

    console.log('Load page ...')

    const originPageSize = Object.values(originResources)
      .map(({ size }) => size || 0)
      .reduce((sum, size) => sum + size, 0)

    console.log('size page origin ', originPageSize)
    const originScreenshotPath = await screenshot(originPage, `${ params.tag }-origin`, progress, screenshotDir, i)

    const originMetrics = await metrics(originPage)

    if (i === 0) {
      originImgTags = await getImageTag(originPage)
    }

    // TODO:  save to mongo

    await originPage.close()
  }

//page optimize
  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    const newPage = await initPage(browser, params)
    console.log('Init optimize page ... ')
    const optimizeData = await receivedData(newPage)

    const optimizeResources = await responsePage(newPage, optimizeData)

    const optimizePage = await intepreceptionRequest(newPage, originImgTags)

    await loadPage(optimizePage, params, progress, screenshotDir, i)

    console.log('Load optimize page ....')

    const optimizePageSize = Object.values(optimizeResources)
      .map(({ size }) => size || 0)
      .reduce((sum, size) => sum + size, 0)

    const optimizeScreenshotPath = await screenshot(optimizePage, `${ params.tag }-optimize`, progress, screenshotDir, i)

    const optimizeMetrics = await metrics(optimizePage, optimizePageSize)
    console.log('size page optimize ', optimizePageSize)
    // TODO:  save to mongo
    await optimizePage.close()
  }

  console.log('Close browser...')

  // progress(`Close browser...`)

  await browser.close()

  // progress(`Close browser... done`, true)
  console.log('browser close done')
  // TODO:  save report
}

export default analyze
