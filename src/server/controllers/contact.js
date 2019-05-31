import bodyParser from 'body-parser'
import { BAD_REQUEST } from 'http-status-codes'
import joi from 'joi'

import contact from 'services/contact'
import recaptcha from 'services/google-recaptcha'

const SCHEMA = joi.object().keys({
  name: joi.string().trim().required(),
  email: joi.string().lowercase().email().required(),
  company: joi.string().allow('').trim(),
  content: joi.string().trim().required(),
  phone: joi.number().allow(''),
  urlAnalyze: joi.string().trim(),
  token: joi.string().trim()
})

export default {
  post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      try {
        const body = req.body
        const { token } = body

        if (!token) {
          return res.sendStatus(BAD_REQUEST)
        }

        const values = await joi.validate(body, SCHEMA)

        const result = await recaptcha(token)

        if (!result.success) {
          return res.sendStatus(BAD_REQUEST)
        }

        await contact.create(values)
        res.render('pages/contact')
      } catch (e) {
        console.log('e', e);
        return res.sendStatus(BAD_REQUEST)
      }
    }
  ]
}
