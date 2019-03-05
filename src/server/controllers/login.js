export default {
  get: [
    (req, res, next) => {
      res.render('admin/login')
    }
  ],
  post: [
    (req, res, next) => {
      res.render('admin/dashboard')
    }
  ],
}
