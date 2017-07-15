'use strict'

const joi = require('joi')

const schema = joi.object({
  service_roles_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  service_roles_defaultPort: joi.number()
    .min(3100)
    .default(3300),

  service_roles_totalInitialInstances: joi.number()
    .min(0)
    .max(50)
    .default(0),

  service_roles_trackRoutesLogs: joi.boolean()
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
  roles: {
    host: value.service_roles_host,
    defaultPort: value.service_roles_defaultPort,
    totalInitialInstances: value.service_roles_totalInitialInstances,
    trackRoutesLogs: value.service_roles_trackRoutesLogs,
    publiclyAccessedRoutes: [
      '/api/v1/roles'
    ],
    routes: {
      default: {
        apiPathPrefix: '/api/v1'
      }
    }
  }
}

module.exports = config
