import express from 'express'
import ms from 'ms'
import session from 'express-session'
import slash from 'express-slash'
import morgan from 'morgan'
import path from 'path'

import config from 'infrastructure/config'
import initAsset from './asset'
import initBrowser from './browser'
import initRoutes from './routing'
import initViewEngine from './view-engine'

export default async () => {
  const app = express()

  app.enable('strict routing')
  app.enable('trust proxy')
  app.disable('x-powered-by')
  app.use(morgan('dev'), slash())

  app.set('trust proxy', 1)

  app.use(session({
    secret: config.session.secret,
    resave: true,
    cookie: { maxAge: ms(config.session.ttl) },
    saveUninitialized: true

  }))
  await initAsset(app)
  await initBrowser(app)
  await initViewEngine(app)

  await initRoutes(app)

  return app
}
