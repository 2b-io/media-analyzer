export default {
  post: [
    async (req, res, next) => {
      req.session.destroy((err) => {
        return next(err)
      })
      return res.redirect('/login')
    }
  ]
}
