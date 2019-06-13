import { NOT_FOUND } from 'http-status-codes'
import prettyBytes from 'pretty-bytes'
import prettyMs from 'pretty-ms'
import serializeError from 'serialize-error'

import * as controllers from 'controllers'
import config from 'infrastructure/config'

const safeController = (controller) => {
  if (Array.isArray(controller)) {
    return controller.map(safeController)
  }

  return async (req, res, next) => {
    try {
      await controller(req, res, next)
    } catch (e) {
      console.error(e)

      next(e)
    }
  }
}

export default (app) => {
  // config
  app.locals.googleRecaptchaSiteKey = config.googleRecaptchaSiteKey
  app.locals.googleAnalyticsId = config.googleAnalyticsId
  app.locals.cdn = config.devMode ? '' : config.optimizerEndpoint

  // view helpers
  app.locals.prettyBytes = (value) => value ? prettyBytes(value) : 'N/A'
  app.locals.prettyMs = (value) => value ? prettyMs(value) : 'N/A'

  app.get('/', controllers.home.get)

  app.get('/reports/:identifier', controllers.report.get)
  app.get('/reports/:identifier/detail', controllers.reportDetail.get)

  app.post('/reports', safeController(controllers.report.post))
  app.post('/contact', controllers.contact.post)

  app.get('/login', controllers.login.get)
  app.post('/login', controllers.login.post)

  app.get('/dashboard', controllers.dashboard.get)
  app.get('/dashboard/reports', controllers.reports.get)

  app.post('/logout', controllers.logout.post)

  app.use((req, res, next) => {
    if (config.devMode) {
      return res.sendStatus(NOT_FOUND)
    }

    res.redirect('/')
  })

  app.use((error, req, res, next) => {
    if (config.devMode) {
      return res.sendStatus(500).end(serializeError(error))
    }

    return res.redirect('/')
  })
}
