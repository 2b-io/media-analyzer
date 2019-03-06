import sessionService from 'services/session'

export default {
  get: [
    async (req, res, next) => {
      try {
        const { token } = req.session

        const authenticatedAccount = await sessionService.verify(token)

        if (!authenticatedAccount) {
          // return res.redirect('/login')
        }
        return res.render('admin/dashboard')
      } catch (e) {
        return res.redirect('/login')
      }
    }
  ]
}
