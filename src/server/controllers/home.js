import config from 'infrastructure/config'

export default {
  get: [
    (req, res, next) => {
      res.render('pages/home', {
        reports: [],
        googleRecaptchaSiteKey: config.googleRecaptchaSiteKey
      })
    }
  ]
}
