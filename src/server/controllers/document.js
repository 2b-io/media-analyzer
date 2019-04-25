import bodyParser from 'body-parser'
import { BAD_REQUEST } from 'http-status-codes'
import joi from 'joi'

import recaptcha from 'services/google-recaptcha'

export default {
  get: [
    (req, res, next) => {
      res.render('pages/document')
    }
  ]
}
