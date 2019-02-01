import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'

import reportService from 'services/report'

export default {
  get: [
    (req, res, next) => {
      res.locals.prettyBytes = prettyBytes
      res.locals.prettyMs = prettyMs

      next()
    },
    async (req, res, next) => {
      const recentReports = await reportService.list({
        error: {
          $ne: true
        },
        original: {
          $ne: null
        },
        optimized: {
          $ne: null
        }
      }, null, {
        limit: 20
      })

      res.render('pages/home', {
        reports: recentReports
      })
    }
  ]
}
