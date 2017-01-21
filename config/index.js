'use strict'

const fs = require('fs')
const path = require('path')

/* Secure the usage of only these environments */
const validEnvironments = ['local', 'production']
if (!~validEnvironments.indexOf(process.env.NODE_ENV)) {
  throw new TypeError(`process.env.NODE_ENV must be one of ["${validEnvironments.join('", "')}"] but same is "${process.env.NODE_ENV}"`)
}

const config = {
  services: {}
}

/* Bind main configurations */
fs
  /* Get all configuration modules */
  .readdirSync(path.resolve(__dirname, './modules'))

  /* Be sure we're dealing only with configuration files */
  .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, './modules', itemPath)).isFile())

  /* Secure consistent order of binding */
  .sort()

  /* Bind each configuration to the common 'config' */
  .forEach((itemPath) => {
    const moduleConfig = require(path.resolve(__dirname, './modules', itemPath))
    Object.assign(config, moduleConfig)
  })

/* Bind service configurations */
fs
  /* Get all configuration modules */
  .readdirSync(path.resolve(__dirname, './modules/services'))

  /* Be sure we're dealing only with configuration files */
  .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, './modules/services', itemPath)).isFile())

  /* Secure consistent order of binding */
  .sort()

  /* Bind each configuration to the common 'config' */
  .forEach((itemPath) => {
    const moduleConfig = require(path.resolve(__dirname, './modules/services', itemPath))
    Object.assign(config.services, moduleConfig)
  })

const environment = process.env.NODE_ENV
config.environment = environment

console.log('Configuration in use', JSON.stringify(config, undefined, 2))

module.exports = config
