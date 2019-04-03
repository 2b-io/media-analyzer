import express from 'express'
import slash from 'express-slash'
import morgan from 'morgan'
import path from 'path'

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

  await initAsset(app)
  await initBrowser(app)
  await initViewEngine(app)

  await initRoutes(app)

  return app
}
