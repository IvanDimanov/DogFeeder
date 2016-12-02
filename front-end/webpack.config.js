'use strict'

const path = require('path')

const webpack = require('webpack')
const DefinePlugin = require('webpack').DefinePlugin
const DashboardPlugin = require('webpack-dashboard/plugin')

const config = require('../config')

const plugin = [
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
  plugin.push(
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin()
  )
}

const mainEntry = [
  './roots/main'
]

/* Secure Webpack Hot reload when we have standalone calls */
if (process.env.dashboard) {
  mainEntry.push(
    'webpack-dev-server/client?http://127.0.0.1:8000',
    'webpack/hot/only-dev-server'
  )
}

module.exports = {
  entry: {
    main: mainEntry
  },
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
        presets: ['react', 'latest']
      }
    }]
  },

  plugins: plugin
}
