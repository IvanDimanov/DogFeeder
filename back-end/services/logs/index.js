'use strict'

const fs = require('fs')
const path = require('path')

const koa = require('koa')
const koaBody = require('koa-body')

const projectRootPath = '../../../'
const config = require(`${projectRootPath}/config`)
const logger = require(`${projectRootPath}/shared-modules/logger`)

const serviceName = path.parse(__dirname).name
const host = config.services[ serviceName ].host || 'localhost'
const instancePort = process.env.NODE_APP_INSTANCE | 0
const basePort = config.services[ serviceName ].defaultPort || 3000
const port = basePort + instancePort

/* Used in logging */
global.serviceName = serviceName
global.instanceId = instancePort

const app = koa()

app
  .use(logger.koaMiddleware)
  .use(koaBody())

/* Bind all service Routes from directory './routes' to the current koa 'app' server */
;(() => fs
  /* Get all service HTTP routes */
  .readdirSync(path.resolve(__dirname, './routes'))

  /* Be sure we're dealing only with routes Directories */
  .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, './routes', itemPath)).isDirectory())

  /* Secure consistent order of binding */
  .sort()

  /* Bind each route to the common koa server */
  .map((itemPath) => {
    const serviceRoute = require(path.resolve(__dirname, './routes', itemPath))
    app
      .use(serviceRoute.routes())
      .use(serviceRoute.allowedMethods())
  })
)()

app
  .listen(port, host, () => logger.info(`Service ${serviceName} running on ${host}:${port}`))
