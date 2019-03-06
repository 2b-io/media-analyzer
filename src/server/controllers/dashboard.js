import sessionService from 'services/session'

export default {
  get: [
    async (req, res, next) => {
      try {
        const { token } = req.session

        if (!token) {
          return res.redirect('/login')
        }

        const section = await sessionService.verify(token)

        if (!section.token) {
          return res.redirect('/login')
        }
        return res.render('admin/dashboard')
      } catch (e) {
        return res.redirect('/login')
      }
    }
  ]
}
