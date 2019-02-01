import express from 'express'
import slash from 'express-slash'
import morgan from 'morgan'
import path from 'path'

import initAsset from './asset'
import initRoutes from './routing'
import initViewEngine from './view-engine'

const state = {}

export default () => {
  if (!state.app) {
    const app = express()

    app.enable('strict routing')
    app.enable('trust proxy')
    app.disable('x-powered-by')

    app.use(morgan('dev'), slash())

    initAsset(app)
    initViewEngine(app)

    initRoutes(app)

    state.app = app
  }

  return state.app
}
