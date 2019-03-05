import bodyParser from 'body-parser'

import config from 'infrastructure/config'
import accountService from 'services/account'

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
        const account = await accountService.verify({
          email,
          password
        })

        if (account) {
          req.session.account = 'session'
          return res.redirect('/dashboard')
        }
        res.render('admin/login')
      } catch (e) {
        res.render('admin/login')
      }
    }
  ],
}
