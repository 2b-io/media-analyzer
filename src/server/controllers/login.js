import bodyParser from 'body-parser'

import config from 'infrastructure/config'
import accountService from 'services/account'
import sessionService from 'services/session'
import verifySession from 'middlewares/verify-session'

export default {
  get: [
    verifySession,
    async (req, res, next) => {
      try {
        const accounts = await accountService.list()
        if (!accounts.length) {
          await accountService.create({
            email: config.emailAdmin,
            password: config.passwordAdmin
          })
        }

        if (req.session.loggedIn ) {
          return res.redirect('/dashboard')
        } else {
          return res.render('admin/login')
        }

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

        req.session.regenerate((err) => {
          if (err) {
            return next(err)
          }
        })

        req.session.save((err) => {
          if (err) {
            return next(err)
          }
        })

        req.session.loggedIn = true
        req.session.account = account

        return res.redirect('/dashboard')
      } catch (e) {
        console.error('Error', e)
        return res.render('admin/login')
      }
    }
  ],
}
