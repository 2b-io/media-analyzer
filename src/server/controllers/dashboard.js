import verifySession from 'middlewares/verify-session'

export default {
  get: [
    verifySession,
    async (req, res, next) => {
      try {
        return res.render('admin/dashboard', { account: req.session.account })
      } catch (e) {
        return res.redirect('/login')
      }
    }
  ]
}
