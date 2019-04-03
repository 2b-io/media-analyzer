import callPuppeteer from 'services/analyzer/launch-puppeteer'
import callGooglePagespeed from 'services/analyzer/launch-google-page-speed'

import reportService from 'services/report'

export const analyze = async (params) => {
  const { url, identifier } = params
  try {
    console.time('time analyze')

    const [
      desktopPuppeteerResult,
      mobilePuppeteerResult,
      desktopPageSpeedResult,
      mobilePageSpeedResult
    ] = await Promise.all([
      callPuppeteer(params, 'desktop'),
      callPuppeteer(params, 'mobile'),
      callGooglePagespeed(url, identifier, 'desktop'),
      callGooglePagespeed(url, identifier, 'mobile')
    ])

  } catch (e) {
    throw e
  } finally {
    await reportService.update(identifier, {
      finish: true
    })
    await reportService.updateProgress(identifier, 'Finished!')

    console.timeEnd('time analyze')
  }
}
