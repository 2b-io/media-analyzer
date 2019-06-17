import bodyParser from 'body-parser'

import sessionService from 'services/session'
import reportService from 'services/report'
import verifySession from 'middlewares/verify-session'
export default {
  get: [
    verifySession,
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      try {
        const  page = req.query.page

        const url = req.query.url || ''

        const params = url ? { url: { $regex: `${ escape(url) }.*` } } : {}

        const query = url ? `&url=${ url }` : ''

        const reports = await reportService.list(params , page, query)

        return res.render('admin/reports', { account: req.session.account, data: reports, url })
      } catch (e) {
        return res.redirect('/login')
      }
    }
  ]
}
