import request from 'superagent'

import config from 'infrastructure/config'

const recaptcha = async (token) => {
  const response = await request.post(config.googleRecaptchaUrl)
    .type('form')
    .send({
      secret: config.googleGoogleRecaptchaApiKey,
      response: token
    })

  return response.body
}

export default recaptcha
