'use strict'

const joi = require('joi')

const schema = joi.object({
  front_end_protocol: joi.string()
    .allow(['http', 'https'])
    .default('http'),

  front_end_host: joi.string()
    .ip()
    .default('127.0.0.1'),

  front_end_port: joi.number()
    .min(3000)
    .default(8000),

  front_end_successMessageAutoHideDuration: joi.number()
    .min(100)
    .max(30 * 1000)
    .default(3000)

}).unknown()
  .required()

const {error, value} = joi.validate(process.env, schema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  'front-end': {
    protocol: value.front_end_protocol,
    host: value.front_end_host,
    port: value.front_end_port,
    successMessageAutoHideDuration: value.front_end_successMessageAutoHideDuration
  }
}

module.exports = config
