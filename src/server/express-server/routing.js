import { NOT_FOUND } from 'http-status-codes'
import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'

import * as controllers from 'controllers'

export default (app) => {
  app.locals.prettyBytes = (value) => value ? prettyBytes(value) : 'N/A'
  app.locals.prettyMs = (value) => value ? prettyMs(value) : 'N/A'

  app.get('/', controllers.home.get)

  app.get('/reports/:identifier', controllers.report.get)

  app.post('/reports', controllers.report.post)

  app.use((req, res, next) => {
    res.sendStatus(NOT_FOUND)
  })
}
