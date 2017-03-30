'use strict'

const path = require('path')

const webpack = require('webpack')
const DefinePlugin = require('webpack').DefinePlugin
const DashboardPlugin = require('webpack-dashboard/plugin')

const config = require('../config')

/* Resolves something close to 8080 */
const developmentPort = config['front-end'].port + 80

const plugins = [
  /*
    We gonna cherry-pick only some configs because
    not all configurations are suitable to be exposed to the FE
  */
  new DefinePlugin({
    __CONFIG__: JSON.stringify(Object.assign(
      {environment: config.environment},
      {'front-end': config['front-end']}
    ))
  })
]

/* Secure Webpack-Dashboard standalone calls */
if (process.env.dashboard) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin()
  )
}

const entries = {
  main: ['./roots/main'],
  login: ['./roots/login']
}

/* Secure Webpack Hot reload when we have standalone calls */
if (process.env.dashboard) {
  Object.keys(entries)
    .forEach((entryName) => entries[entryName].push(
      `webpack-dev-server/client?http://${config['front-end'].host}:${developmentPort}`,
      'webpack/hot/only-dev-server'
    ))
}

module.exports = {
  entry: entries,
  output: {
    path: path.resolve('./public'),
    filename: 'assets/js/[name].bundle.js'
  },

  cache: process.env.NODE_ENV === 'local',
  clearBeforeBuild: process.env.NODE_ENV === 'local',

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|theme)/,
      loader: 'babel',
      query: {
        cacheDirectory: process.env.NODE_ENV === 'local',
        presets: ['react', 'latest'],
        plugins: ['transform-class-properties', 'transform-object-rest-spread']
      }
    }]
  },

  plugins: plugins,

  devServer: {
    contentBase: './public',
    port: developmentPort,
    stats: {
      colors: true
    }
  }
}
