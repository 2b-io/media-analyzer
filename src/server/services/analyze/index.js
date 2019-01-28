import delay from 'delay'
import mkdirp from 'mkdirp'
import path from 'path'

import analyzeOriginPage from 'services/analyze/analyze-origin-page'
import analyzeOptimizePage from 'services/analyze/analyze-optimize-page'
import initPage from 'services/analyze/init-page'

const LOAD_NUMBER = 3
const screenshotDir = path.join(__dirname, '../../../../screenshot')
mkdirp.sync(screenshotDir)

const analyze = async (params, progress) => {
  const { tag:reportTag, url } = params

  progress(`Analyze tag: ${reportTag}`)

  const page = await initPage(params, progress)

    for (var i = 0; i < LOAD_NUMBER; i++) {
      await analyzeOriginPage(page, params, progress, screenshotDir, i)
      await delay(3000)
    }

    for (var i = 0; i < LOAD_NUMBER; i++) {
      await analyzeOptimizePage(page, params, progress, screenshotDir, i)
      await delay(3000)
    }
}

export default analyze
