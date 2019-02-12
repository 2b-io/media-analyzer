import reportService from 'services/report'

export default {
  get: [
    async (req, res, next) => {
      const recentReports = await reportService.list({
        error: {
          $ne: true
        },
        desktop: {
          $ne: null
        },
        mobile: {
          $ne: null
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
