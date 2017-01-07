'use strict'

const fs = require('fs')
const path = require('path')

const koa = require('koa')
const koaBody = require('koa-body')
const koaCors = require('koa-cors')

const config = require('../../config')
const logger = require('../logger')

const moduleParentDirectory = path.parse(module.parent.filename).dir
const serviceName = path.parse(moduleParentDirectory).name
const host = config.services[ serviceName ].host || 'localhost'
const instancePort = process.env.NODE_APP_INSTANCE | 0
const basePort = config.services[ serviceName ].defaultPort || 3000
const port = basePort + instancePort

/* Used in logging */
global.serviceName = serviceName
global.instanceId = instancePort

const app = koa()

if (config.trackRoutesLogs) {
  app.use(logger.koaMiddleware)
}

app
  .use(koaBody())

/* Boost the Local development by letting any FE application use this BackEnd */
if (config.environment === 'local') {
  app.use(koaCors())
}

require('koa-qs')(app)

/* Bind all service Routes from directory './routes' to the current koa 'app' server */
;(() => fs
  /* Get all service HTTP routes */
  .readdirSync(path.resolve(moduleParentDirectory, './routes'))

  /* Be sure we're dealing only with routes Directories */
  .filter((itemPath) => fs.lstatSync(path.resolve(moduleParentDirectory, './routes', itemPath)).isDirectory())

  /* Secure consistent order of binding */
  .sort()

  /* Bind each route to the common koa server */
  .map((itemPath) => {
    const serviceRoute = require(path.resolve(moduleParentDirectory, './routes', itemPath))
    app
      .use(serviceRoute.routes())
      .use(serviceRoute.allowedMethods())
  })
)()

app
  .listen(port, host, () => logger.info(`Service ${serviceName} running on ${host}:${port}`))

module.exports = app
