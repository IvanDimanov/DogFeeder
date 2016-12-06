'use strict'

const fs = require('fs')
const path = require('path')

const services = fs
  /* Get all possible service's proxies */
  .readdirSync(path.join(__dirname, './services'))

  /* Be sure we're dealing only with service proxy Files */
  .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, './services', itemPath)).isFile())

  /* Secure consistent order of execution */
  .sort()

  .reduce((services, itemPath) => {
    const serviceProxy = require(path.join(__dirname, './services', itemPath))

    if (services[ serviceProxy.name ]) {
      throw new ReferenceError(`Service proxy with name "${serviceProxy.name}" already exists`)
    }

    services[ serviceProxy.name ] = serviceProxy.proxies
    return services
  }, {})

module.exports = services
