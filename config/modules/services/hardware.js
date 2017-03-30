'use strict'

const joi = require('joi')

const schema = joi.object({
  service_hardware_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  service_hardware_defaultPort: joi.number()
    .min(3100)
    .default(3500),

  service_hardware_totalInitialInstances: joi.number()
    .min(0)
    .max(50)
    .default(1),

  service_hardware_trackRoutesLogs: joi.boolean()
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
  hardware: {
    host: value.service_hardware_host,
    defaultPort: value.service_hardware_defaultPort,
    totalInitialInstances: value.service_hardware_totalInitialInstances,
    trackRoutesLogs: value.service_hardware_trackRoutesLogs,
    publiclyAccessedRoutes: [
      '/api/v1/hardware'
    ],
    routes: {
      default: {
        apiPathPrefix: '/api/v1'
      }
    }
  }
}

module.exports = config
