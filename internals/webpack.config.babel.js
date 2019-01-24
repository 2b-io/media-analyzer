import glob from 'glob'
import path from 'path'

import CleanWebpackPlugin from 'clean-webpack-plugin'
import WebpackAssetsManifest from 'webpack-assets-manifest'

const rootDir = path.join(__dirname, '..')
const resourceDir = path.join(rootDir, './src/resources')
const outDir = path.join(rootDir, 'data/dist/assets')

const cdn = 'http://d-14:3006'

export default {
  mode: 'production',
  entry: {
    home: glob.sync(
      path.join(resourceDir, 'pages/home/index.*')
    )
  },
  output: {
    path: outDir,
    filename: 'js/[name].[hash:6].js',
    publicPath: `${ cdn }/assets`
  },
  plugins: [
    new CleanWebpackPlugin([ outDir ], {
      verbose: true,
      watch: true,
      allowExternal: true
    }),
    new WebpackAssetsManifest({
      output: path.join(outDir, '../manifest.json'),
      publicPath: `${ cdn }/assets/`,
      writeToDisk: true
    })
  ]
}
