'use strict'

const diff = require('deep-diff').diff

/* Secure the usage of only these environments */
const validEnvironments = ['local', 'production']
if (!~validEnvironments.indexOf(process.env.NODE_ENV)) {
  throw new TypeError(`process.env.NODE_ENV must be one of ["${validEnvironments.join('", "')}"] but same is "${process.env.NODE_ENV}"`)
}

/* Verify that all configs are consistent */
{
  /*
    Will combine the array JSON path with the JSON missing object.
    Example:
      if 'diff' is
        DiffDeleted {
          kind: 'D',
          path: [ 'services', 'auth', 'maxTokenLifetime2' ],
          lhs: 604800000 }

      then 'getMissingObj(diff)' result will be
        {
          "services": {
            "auth": {
              "maxTokenLifetime2": 604800000
            }
          }
        }
  */
  function getMissingObj (diff) {
    let obj = diff.path
      .reduce((str, path) => `${str}{"${path}":`, '')

    obj += JSON.stringify(diff.lhs)
    obj += '}'.repeat(diff.path.length)

    return JSON.parse(obj)
  }

  const productionConfig = require('./environments/production.json')
  const localConfig = require('./environments/local.json')

  const missingKeysMessage = (diff(localConfig, productionConfig) || [])
    .filter((diff) => diff.kind === 'D')
    .reduce((accumulated, diff) => `${accumulated}\n${JSON.stringify(getMissingObj(diff), undefined, 2)}\n`, '')

  if (missingKeysMessage.length) {
    throw new ReferenceError(`Production configuration "./environments/production.json" have missing keys compared to\nLocal configuration "./environments/local.json":\n${missingKeysMessage}`)
  }
}

const environment = process.env.NODE_ENV
const config = require(`./environments/${environment}`)

config.environment = environment

module.exports = config
