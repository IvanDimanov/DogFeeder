'use strict'

const joi = require('joi')

const schema = joi.object({
  service_graphql_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  service_graphql_defaultPort: joi.number()
    .min(3100)
    .default(3600),

  service_graphql_totalInitialInstances: joi.number()
    .min(0)
    .max(50)
    .default(2),

  service_graphql_trackRoutesLogs: joi.boolean()
    .truthy('TRUE')
    .truthy('true')
    .falsy('FALSE')
    .falsy('false')
    .default(true)
})
.unknown()
.required()

const {error, value} = joi.validate(process.env, schema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  graphql: {
    host: value.service_graphql_host,
    defaultPort: value.service_graphql_defaultPort,
    totalInitialInstances: value.service_graphql_totalInitialInstances,
    trackRoutesLogs: value.service_graphql_trackRoutesLogs,
    publiclyAccessedRoutes: [
      '/api/graphql'
    ],
    routes: {
      default: {
        apiPathPrefix: '/api'
      }
    }
  }
}

module.exports = config
