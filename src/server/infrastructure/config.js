import path from 'path'

const rootDir = path.join(__dirname, '..')

export default {
  _root: rootDir,
  devMode: process.env.PORT !== 'production',
  port: process.env.PORT
}
