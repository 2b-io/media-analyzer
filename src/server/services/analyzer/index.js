import callPuppeteer from 'services/analyzer/launch-puppeteer'
import callGooglePagespeed from 'services/analyzer/launch-google-page-speed'

import reportService from 'services/report'

export const analyze = async (params) => {
  const { url, identifier } = params
  try {
    const [
      puppeteerResult,
      desktopPageSpeedResult,
      mobilePageSpeedResult
    ] = await Promise.all([
      callPuppeteer(params),
      callGooglePagespeed(url, identifier, 'desktop'),
      callGooglePagespeed(url, identifier, 'mobile')
    ])

  } catch (e) {
    throw e
  } finally {
    await reportService.updateProgress(identifier, 'Finished!')
  }
}
