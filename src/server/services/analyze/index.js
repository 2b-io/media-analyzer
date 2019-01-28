import delay from 'delay'
import mkdirp from 'mkdirp'
import path from 'path'

import getImageTag from 'services/analyze/get-image-tag'
import initBrowser from 'services/analyze/init-browser'
import initPage from 'services/analyze/init-page'
import loadPage from 'services/analyze/load-page'
import intepreceptionRequest from 'services/analyze/intepreception-request'

const LOAD_PAGE_NUMBER = 3
const screenshotDir = path.join(__dirname, '../../../../screenshot')
mkdirp.sync(screenshotDir)

const analyze = async (params, progress) => {
  const { tag:reportTag, url } = params

  progress(`Analyze tag: ${reportTag}`)

  const browser = await initBrowser()

// page origin
  const originPage = await initPage(browser, params)

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    await loadPage(originPage, params, progress, screenshotDir, i)

    await delay(500)
  }

  const originImgTags = await getImageTag(originPage)

  await originPage.close()

//page optimize
  const newPage = await initPage(browser, params)

  const optimizePage = await intepreceptionRequest(newPage, originImgTags)

  for (var i = 0; i < LOAD_PAGE_NUMBER; i++) {
    await loadPage(optimizePage, params, progress, screenshotDir, i)

    await delay(500)
  }

  await optimizePage.Close()

  progress(`Close browser...`)

  await browser.close()

  progress(`Close browser... done`, true)

  // TODO:  save report
}

export default analyze
