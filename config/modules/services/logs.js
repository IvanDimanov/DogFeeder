'use strict'

const joi = require('joi')

const schema = joi.object({
  service_logs_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  service_logs_defaultPort: joi.number()
    .min(3100)
    .default(3100),

  service_logs_totalInitialInstances: joi.number()
    .min(0)
    .max(50)
    .default(1),

  service_logs_trackRoutesLogs: joi.boolean()
    .truthy('TRUE')
    .truthy('true')
    .falsy('FALSE')
    .falsy('false')
    .default(false)
})
.unknown()
.required()

const {error, value} = joi.validate(process.env, schema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  logs: {
    host: value.service_logs_host,
    defaultPort: value.service_logs_defaultPort,
    totalInitialInstances: value.service_logs_totalInitialInstances,
    trackRoutesLogs: value.service_logs_trackRoutesLogs,
    publiclyAccessedRoutes: [
      '/api/v1/logs'
    ],
    routes: {
      system: {
        apiPathPrefix: '/api/v1'
      }
    }
  }
}

module.exports = config
