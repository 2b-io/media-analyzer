import express from 'express'
import slash from 'express-slash'
import morgan from 'morgan'
import path from 'path'

import config from 'infrastructure/config'

import initAsset from './asset'
import initRoutes from './routing'
import initViewEngine from './view-engine'

const state = {}

const screenshotDir = path.join(config._root, '../../data/screenshots')

export default () => {
  if (!state.app) {
    const app = express()

    app.enable('strict routing')
    app.enable('trust proxy')
    app.disable('x-powered-by')

    app.use(morgan('dev'), slash())
    app.use('/screenshots', express.static(screenshotDir))
    initAsset(app)
    initViewEngine(app)

    initRoutes(app)

    state.app = app
  }

  return state.app
}
