'use strict'

const joi = require('joi')

const schema = joi.object({
  service_users_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  service_users_defaultPort: joi.number()
    .min(3100)
    .default(3400),

  service_users_totalInitialInstances: joi.number()
    .min(0)
    .max(50)
    .default(0),

  service_users_trackRoutesLogs: joi.boolean()
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
  users: {
    host: value.service_users_host,
    defaultPort: value.service_users_defaultPort,
    totalInitialInstances: value.service_users_totalInitialInstances,
    trackRoutesLogs: value.service_users_trackRoutesLogs,
    publiclyAccessedRoutes: [
      '/api/v1/users'
    ],
    routes: {
      default: {
        apiPathPrefix: '/api/v1'
      }
    }
  }
}

module.exports = config
