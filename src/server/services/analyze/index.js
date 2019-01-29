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

const LOAD_PAGE_NUMBER = 3
const screenshotDir = path.join(__dirname, '../../../../screenshot')
mkdirp.sync(screenshotDir)

const analyze = async (params, progress) => {
  const { tag: reportTag, url } = params


  // progress(`Analyze tag: ${reportTag}`)

  const browser = await initBrowser()

// page origin
  console.log('Init origin page ... ')
  const originPage = await initPage(browser, params)

  const originData = await receivedData(originPage)

  const originResources = await responsePage(originPage, originData)

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    await loadPage(originPage, params, progress)

    console.log('Load page ....')
    let originPageSize = 0
    Object.values(originResources).map(({ size }) => {
      if (!isNaN(size)) {
        originPageSize = originPageSize + size
      }
    })

    await screenshot(originPage, `${ params.tag }-origin`, progress, screenshotDir, i)

    await metrics(originPage, originPageSize)
  }

  const originImgTags = await getImageTag(originPage)

  await originPage.close()

//page optimize
  const newPage = await initPage(browser, params)
  console.log('Init optimize page ... ')
  const optimizeData = await receivedData(newPage)

  const optimizeResources = await responsePage(newPage, optimizeData)

  const optimizePage = await intepreceptionRequest(newPage, originImgTags)

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    await loadPage(optimizePage, params, progress, screenshotDir, i)

    console.log('Load optimize page ....')

    let optimizePageSize = 0
    Object.values(optimizeResources).map(({ size }) => {
      if (!isNaN(size)) {
        optimizePageSize = optimizePageSize + size
      }
    })

    await screenshot(optimizePage, `${ params.tag }-optimize`, progress, screenshotDir, i)

    await metrics(optimizePage, optimizePageSize)
  }

  await optimizePage.close()

  console.log('Close browser...')

  // progress(`Close browser...`)

  await browser.close()

  // progress(`Close browser... done`, true)
  console.log('browser close done')
  // TODO:  save report
}

export default analyze
