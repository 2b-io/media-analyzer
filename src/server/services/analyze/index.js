import mkdirp from 'mkdirp'
import path from 'path'

import getImageTag from 'services/analyze/get-image-tag'
import initBrowser from 'services/analyze/init-browser'
import initPage from 'services/analyze/init-page'
import intepreceptionRequest from 'services/analyze/intepreception-request'
import metrics from 'services/analyze/metrics'
import loadPage from 'services/analyze/load-page'
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

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    await loadPage(originPage, params, progress)

    console.log('Load page ....')

    await screenshot(originPage, `${ params.tag }-origin`, progress, screenshotDir, i)

    await metrics(originPage)
  }

  const originImgTags = await getImageTag(originPage)

  await originPage.close()

//page optimize
  const newPage = await initPage(browser, params)
  console.log('Init optimize page ... ')

  const optimizePage = await intepreceptionRequest(newPage, originImgTags)

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    await loadPage(optimizePage, params, progress, screenshotDir, i)

    console.log('Load optimize page ....')

    await screenshot(optimizePage, `${ params.tag }-optimize`, progress, screenshotDir, i)

    await metrics(optimizePage)
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
