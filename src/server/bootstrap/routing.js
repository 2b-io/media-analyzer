import * as controllers from 'controllers'

export default (app) => {
  app.get('/', controllers.home.get)
}
