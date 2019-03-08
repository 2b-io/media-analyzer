import sessionService from 'services/session'
import reportService from 'services/report'

export default {
  get: [
    async (req, res, next) => {
      try {
        const { account } = req.session
        const { page } = req.query || 1

        if (!account) {
          return res.redirect('/login')
        }

        const reports = await reportService.list(page)

        return res.render('admin/reports', { account, data: reports })
      } catch (e) {
        console.error('Error', e)

        return res.redirect('/login')
      }
    }
  ]
}
