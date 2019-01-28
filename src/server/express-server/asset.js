import fs from 'fs-extra'
import path from 'path'

import config from 'infrastructure/config'

export default (app) => {
  const manifest = fs.readJsonSync(path.resolve(config._root, '../../data/dist/manifest.json'))

  app.locals.__asset = (file) => manifest[file]

  return app
}
