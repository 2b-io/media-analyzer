import bodyParser from 'body-parser'

import config from 'infrastructure/config'
import accountService from 'services/account'
import sessionService from 'services/session'

export default {
  get: [
    async (req, res, next) => {
      try {
        const accounts = await accountService.list()
        if (!accounts.length) {
          await accountService.create({
            email: config.emailAdmin,
            password: config.passwordAdmin
          })
        }

        res.render('admin/login')
      } catch (e) {
        return res.redirect('/')
      }
    }
  ],
  post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      const body = req.body
      const { email, password } = body
      try {
        const section = await sessionService.create({
          email,
          password
        })

        if (section) {
          req.session.token = section.token
          return res.redirect('/dashboard')
        }

        return res.render('admin/login')
      } catch (e) {
        return res.render('admin/login')
      }
    }
  ],
}
