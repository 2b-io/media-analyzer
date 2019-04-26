import { BAD_REQUEST } from 'http-status-codes'

export default {
  get: [
    (req, res, next) => {
      res.render('pages/about')
    }
  ]
}
