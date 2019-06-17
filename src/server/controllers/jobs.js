import bodyParser from 'body-parser'

import sessionService from 'services/session'
import jobService from 'services/job'
import verifySession from 'middlewares/verify-session'
export default {
  get: [
    verifySession,
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      try {
        const  page = req.query.page

        const project = req.query.project || ''

        const params = project ? { project: { $regex: `${ escape(project) }.*` } } : {}

        const query = project ? `&project=${ project }` : ''

        const jobs = await jobService.list(params , page, query)

        return res.render('admin/jobs-manager', { account: req.session.account, data: jobs, project })
      } catch (e) {
        return res.redirect('/login')
      }
    }
  ]
}
