import sessionService from 'services/session'
import reportService from 'services/report'
import verifySession from 'middlewares/verify-session'

export default {
  get: [
    verifySession,
    async (req, res, next) => {
      try {
        const { page } = req.query || 1

        const reports = await reportService.list(page)

        return res.render('admin/reports', { account: req.session.account, data: reports })
      } catch (e) {
        console.error('Error', e)
        return res.redirect('/login')
      }
    }
  ]
}
