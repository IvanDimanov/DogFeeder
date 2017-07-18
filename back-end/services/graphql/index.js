'use strict'

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('graphql-server-express')
const onFinished = require('on-finished')
const { addErrorLoggingToSchema } = require('graphql-tools')

const config = require('../../../config')
const logger = require('../../../shared-modules/logger')
const { expressJwtMiddleware } = require('../../../shared-modules/session')

const schema = require('./schema')
addErrorLoggingToSchema(schema, { log: (error) => logger.error(error) })

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

/**
 * Check for JWT Auth on every call
 * but respect that there might be calls that are free of authentication.
 * In order not to throw, we'll keep record if the user was successfully taken from the JWT
 * or there was an error getting the JSON info
 */
app.use('*', (request, response, next) => {
  expressJwtMiddleware({ userProperty: 'token' })(request, response, (error) => {
    if (error) {
      request.token = { error: error }
    }
    next()
  })
})

app.use('/graphql', bodyParser.json(), (request, response, next) => {
  graphqlExpress({
    schema,
    context: request
  })(request, response, next)
})

if (config.environment !== 'production') {
  app.use('/graphiql', (request, response, next) => {
    response.sendFile(path.join(__dirname, '/graphiql.html'))
  })
}

app.listen(port, host, () => logger.info(`Service ${serviceName} running on ${host}:${port}`))
