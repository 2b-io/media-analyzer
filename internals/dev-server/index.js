import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import webpackConfig from '../webpack.config.babel'

const app = express()
const port = 3006

const devServer = process.env.ASSET_ENDPOINT
const state = {
  isStarted: false
}

const compiler = webpack({
  ...webpackConfig,
  mode: 'development',
  entry: Object.entries(webpackConfig.entry).reduce(
    (entry, [ key, value ]) => ({
      ...entry,
      [key]: [
        ...value,
        `webpack-hot-middleware/client?reload=true&path=${ devServer }/__hmr`
      ]
    }),
    {}
  ),
  plugins: [
    ...webpackConfig.plugins,
    new webpack.HotModuleReplacementPlugin()
  ]
})

app.get('/alive', (req, res) => res.sendStatus(204))

app.use([
  morgan('dev'),
  cors(),
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    watchOption: {
      ignore: /node_modules/
    },
    // logLevel: 'warn'
  }),
  webpackHotMiddleware(compiler, {
    path: '/__hmr'
  })
])

compiler.hooks.emit.tap('done', () => {
  if (state.isStarted) {
    return
  }

  app.listen(3006, () => {
    state.isStarted = true
    console.log(`dev-server started at ${ port }`)
  })
})
