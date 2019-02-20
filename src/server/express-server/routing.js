import { NOT_FOUND } from 'http-status-codes'
import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'

import * as controllers from 'controllers'
import config from 'infrastructure/config'

export default (app) => {
  // config
  app.locals.googleRecaptchaSiteKey = config.googleRecaptchaSiteKey
  app.locals.googleAnalyticsId = config.googleAnalyticsId

  // view helpers
  app.locals.prettyBytes = (value) => value ? prettyBytes(value) : 'N/A'
  app.locals.prettyMs = (value) => value ? prettyMs(value) : 'N/A'

  app.get('/', controllers.home.get)

  app.get('/reports/:identifier', controllers.report.get)
  app.get('/reports-detail/:identifier', controllers.reportDetail.get)

  app.post('/reports', controllers.report.post)
  app.post('/contact', controllers.contact.post)

  app.use((req, res, next) => {
    res.sendStatus(NOT_FOUND)
  })
}
