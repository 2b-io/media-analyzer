import bodyParser from 'body-parser'
import joi from 'joi'

import contact from 'services/contact'

const SCHEMA = joi.object().keys({
  name: joi.string().trim().required(),
  email: joi.string().lowercase().email().required(),
  company: joi.string().allow('').trim(),
  content: joi.string().allow('').trim(),
  phone: joi.number().allow('')
})

export default {
  post: [
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      try {
        const body = req.body
        const values = await joi.validate(body, SCHEMA)
        await contact.update(values)
        res.render('pages/contact')
      } catch (e) {
        return
      }
    }
  ]
}
