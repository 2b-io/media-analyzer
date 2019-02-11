import reportService from 'services/report'

export default {
  get: [
    async (req, res, next) => {
      const recentReports = await reportService.list({
        error: {
          $ne: true
        },
        desktop: {
          original: {
            $ne: null
          },
          optimized: {
            $ne: null
          }
        },
        mobile: {
          original: {
            $ne: null
          },
          optimized: {
            $ne: null
          }
        },
        finish: true
      }, null, {
        limit: 20
      })

      res.render('pages/home', {
        reports: recentReports
      })
    }
  ]
}
