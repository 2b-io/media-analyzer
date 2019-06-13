import browserService from 'services/browser'

export default async (app) => {
  app.locals.browserCluster = await browserService.createCluster()
}
