import glob from 'glob'
import path from 'path'

import CleanWebpackPlugin from 'clean-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import WebpackAssetsManifest from 'webpack-assets-manifest'

const rootDir = path.join(__dirname, '..')
const resourceDir = path.join(rootDir, './src/resources')
const outDir = path.join(rootDir, 'data/dist/assets')

const devMode = process.env.NODE_ENV !== 'production'
const cdn = process.env.ASSET_ENDPOINT

export default {
  mode: 'production',
  entry: {
    home: glob.sync(
      path.join(resourceDir, 'pages/home/index.*'),
      { nodir: true }
    ),
    report: glob.sync(
      path.join(resourceDir, 'pages/report/index.*'),
      { nodir: true }
    ),
    ['report-detail']: glob.sync(
      path.join(resourceDir, 'pages/report-detail/index.*'),
      { nodir: true }
    ),
    img: glob.sync(
      path.join(resourceDir, 'img/**/*'),
      { nodir: true }
    )
  },
  output: {
    path: outDir,
    filename: 'js/[name].[hash:6].js',
    publicPath: `${ cdn }/assets`,
    pathinfo: false
  },
  plugins: [
    new CleanWebpackPlugin({
      dry: true,
      watch: true,
      dangerouslyAllowCleanPatternsOutsideProject: true
    }),
    new WebpackAssetsManifest({
      output: path.join(outDir, '../manifest.json'),
      publicPath: `${ cdn }/assets/`,
      writeToDisk: true
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:6].css'
    }),
    new OptimizeCssAssetsPlugin()
  ],
  resolve: {
    extensions: [ '.css', '.js', '.styl' ],
    modules: [
      'node_modules',
      'src/resources'
    ]
  },
  module: {
    rules: [ {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ],
          plugins: [
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-transform-runtime'
          ]
        }
      }
    }, {
      test: /\.css/,
      use: [ {
        loader: devMode ?
          'style-loader' :
          MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader'
      } ]
    }, {
      test: /\.styl$/,
      use: [ {
        loader: devMode ?
          'style-loader' :
          MiniCssExtractPlugin.loader
      }, {
        loader: 'css-loader'
      }, {
        loader: 'stylus-loader',
        options: {
          import: [
            '~kouto-swiss/index.styl'
          ],
          preferPathResolver: 'webpack'
        }
      } ]
    }, {
      test: /\.(ico|jpg|png|gif|svg|bmp|webp|mp4)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'img/[path][name].[hash:6].[ext]',
            publicPath: `${ cdn }/assets`,
            emitFile: true,
            context: 'src/resources/img'
          }
        }
      ]
    },
    {
      test: /\.(ttf|eot|woff|woff2)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:6].[ext]',
            publicPath: `${ cdn }/assets`,
            emitFile: true
          }
        }
      ]
    } ]
  }
}
