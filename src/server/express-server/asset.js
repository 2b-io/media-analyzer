import express from 'express'
import fs from 'fs-extra'
import path from 'path'

import config from 'infrastructure/config'

export default (app) => {
  const manifest = fs.readJsonSync(path.resolve(config._root, '../../data/dist/manifest.json'))

  app.locals.__asset = (file) => manifest[file]

  app.use('/screenshots', express.static(config.screenshotDir))
  app.use('/har', express.static(config.harDir))
  app.use('/img', express.static(config.imgDir))

  return app
}
