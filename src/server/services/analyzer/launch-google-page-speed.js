import googlePageSpeedService from 'services/google-page-speed'
import reportService from 'services/report'

const launchGooglePageSpeed = async (url, identifier, userAgent) => {

  try {
    await reportService.updateProgress(identifier, `Google page speed test ${ userAgent } mode...`)

    const googlePageSpeedData = await googlePageSpeedService(
      url,
      { strategy: userAgent }
    )

    await reportService.updateProgress(identifier, `Google page speed test ${ userAgent }... done`)

    const {
      lighthouseResult: {
        categories: {
          performance: {
            score: performanceScore
          }
        }
      }
    } = googlePageSpeedData

    // summary report
    // delete screenshots & thumbnails: DATA TOO LARGE
    googlePageSpeedData.lighthouseResult.audits['screenshot-thumbnails'] = null
    googlePageSpeedData.lighthouseResult.audits['final-screenshot'] = null

    if (userAgent === 'mobile') {
      await reportService.update(identifier, {
        [ `${ userAgent }LighthouseData` ]: googlePageSpeedData,
        [ `${ userAgent }OriginalScore` ]: performanceScore * 100,
        finish: true
      })
    } else {
      await reportService.update(identifier, {
        [ `${ userAgent }LighthouseData` ]: googlePageSpeedData,
        [ `${ userAgent }OriginalScore` ]: performanceScore * 100,
      })
    }

  } catch (e) {
    console.error('error', e)
    await reportService.update(identifier, {
      finish: true,
      error: true
    })
  }
}

export default launchGooglePageSpeed
