export default {
  get: [
    async (req, res, next) => {
      // const session = req.session
      console.log(req.session.account)
      res.render('admin/dashboard')
    }
  ]
}
