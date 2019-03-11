export default {
  post: [
    async (req, res, next) => {
      req.session.destroy()
      return res.redirect('/login')
    }
  ]
}
