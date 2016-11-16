'use strict'

const path = require('path')

const webpack = require('webpack')
const DefinePlugin = require('webpack').DefinePlugin
const DashboardPlugin = require('webpack-dashboard/plugin')

const config = require('../config')

module.exports = {
  entry: {
    main: [
      'webpack-dev-server/client?http://127.0.0.1:8000',
      'webpack/hot/only-dev-server',
      './roots/main'
    ]
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

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin(),

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
  ],

  devServer: {
    contentBase: './public',
    port: 8000,
    stats: {
      colors: true
    }
  }
}
