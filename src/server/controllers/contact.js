import bodyParser from 'body-parser'
import { BAD_REQUEST } from 'http-status-codes'
import joi from 'joi'

import contact from 'services/contact'
import recaptcha from 'services/google-recaptcha'

const SCHEMA = joi.object().keys({
  name: joi.string().trim().required(),
  email: joi.string().lowercase().email().required(),
  company: joi.string().allow('').trim(),
  content: joi.string().allow('').trim(),
  phone: joi.number().allow(''),
  token: joi.string().trim()
})

export default {
  post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      try {
        const body = req.body
        const token = body['g-recaptcha-response']

        if (!token) {
          return res.sendStatus(BAD_REQUEST)
        }

        delete body['g-recaptcha-response']

        const params = { ...body, token }
        const values = await joi.validate(body, SCHEMA)

        const result = await recaptcha(token)

        if (!result.success) {
          return
        }

        await contact.update(values)
        res.render('pages/contact')
      } catch (e) {
        return res.sendStatus(BAD_REQUEST)
      }
    }
  ]
}
