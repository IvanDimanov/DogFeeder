'use strict'

const joi = require('joi')

const schema = joi.object({
  service_auth_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  service_auth_defaultPort: joi.number()
    .min(3100)
    .default(3200),

  service_auth_totalInitialInstances: joi.number()
    .min(0)
    .max(50)
    .default(0),

  service_auth_trackRoutesLogs: joi.boolean()
    .truthy('TRUE')
    .truthy('true')
    .falsy('FALSE')
    .falsy('false')
    .default(true),

  service_auth_jwtSecretsFileName: joi.string()
    .default('jwt'),

  service_auth_maxTokenLifeTimestamp: joi.number()
    .min(1000)
    .max(30 * 24 * 60 * 60 * 1000)
    .default(3 * 24 * 60 * 60 * 1000),

  service_auth_userPasswordSecretsFileName: joi.string()
    .default('user-password')
})
.unknown()
.required()

const {error, value} = joi.validate(process.env, schema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  auth: {
    host: value.service_auth_host,
    defaultPort: value.service_auth_defaultPort,
    totalInitialInstances: value.service_auth_totalInitialInstances,
    trackRoutesLogs: value.service_auth_trackRoutesLogs,
    publiclyAccessedRoutes: [
      '/api/v1/auth'
    ],
    jwtSecretsFileName: value.service_auth_jwtSecretsFileName,
    maxTokenLifeTimestamp: value.service_auth_maxTokenLifeTimestamp,
    userPasswordSecretsFileName: value.service_auth_userPasswordSecretsFileName,
    routes: {
      default: {
        apiPathPrefix: '/api/v1'
      }
    }
  }
}

module.exports = config
