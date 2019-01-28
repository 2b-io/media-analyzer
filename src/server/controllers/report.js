import { NOT_IMPLEMENTED } from 'http-status-codes'

import Report from 'models/report'

export default {
  get(req, res, next) {
    res.render('pages/report')
  },
  post(req, res, next) {
    res.sendStatus(NOT_IMPLEMENTED)
  }
}
