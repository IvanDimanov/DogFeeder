'use strict'

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const onFinished = require('on-finished')

const config = require('../../../config')
const logger = require('../../../shared-modules/logger')

const schema = require('./schema')

const moduleParentDirectory = path.parse(__filename).dir
const serviceName = path.parse(moduleParentDirectory).name
const serviceConfig = config.services[ serviceName ]
const host = serviceConfig.host || 'localhost'
const instancePort = process.env.NODE_APP_INSTANCE | 0
const basePort = serviceConfig.defaultPort || 3000
const port = basePort + instancePort

/* Used in logging */
global.serviceName = serviceName
global.instanceId = instancePort

const app = express()

if (serviceConfig.trackRoutesLogs) {
  app.use('*', bodyParser.json(), (request, response, next) => {
    logger.expressMiddlewareBeforeAll(request, response, next)
    onFinished(response, (error, response) => logger.expressMiddlewareAfterAll(request, response, error))
  })
}

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(port, host, () => logger.info(`Service ${serviceName} running on ${host}:${port}`))
