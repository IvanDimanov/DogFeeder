'use strict'

const joi = require('joi')

const schema = joi.object({
  default_redis_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  default_redis_port: joi.number()
    .min(3000)
    .default(6379)
})
.unknown()
.required()

const {error, value} = joi.validate(process.env, schema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  database: {
    redis: {
      host: value.default_redis_host,
      port: value.default_redis_port
    }
  }
}

module.exports = config
