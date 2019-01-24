import initAsset from './asset'
import initRoutes from './routing'
import initViewEngine from './view-engine'

export default (app) => {
  initAsset(app)
  initViewEngine(app)

  initRoutes(app)

  return app
}
