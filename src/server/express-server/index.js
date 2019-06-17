import express from 'express'
import ms from 'ms'
import session from 'express-session'
import connectMongo from 'connect-mongodb-session'
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

  const mongoStore = connectMongo(session)
  const store = new mongoStore({
    uri: config.mongodb,
    collection: 'mySessions'
  })

  store.on('error', (error) => {
    console.log('error', error)
  })

  app.use(session({
    secret: config.session.secret,
    resave: true,
    cookie: { maxAge: ms(config.session.ttl) },
    saveUninitialized: true,
    store: store,
  }))

  await initAsset(app)
  await initBrowser(app)
  await initViewEngine(app)
  await initRoutes(app)

  return app
}
