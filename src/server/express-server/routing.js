import { NOT_FOUND } from 'http-status-codes'

import * as controllers from 'controllers'

export default (app) => {
  app.get('/', controllers.home.get)

  app.get('/reports/:identifier', controllers.report.get)

  app.post('/reports', controllers.report.post)

  app.use((req, res, next) => {
    res.sendStatus(NOT_FOUND)
  })
}
