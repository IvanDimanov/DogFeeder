'use strict'

const rp = require('request-promise')
const config = require('../../../config')

const defaultProtocol = config['front-end'].protocol
const defaultHost = config['front-end'].host
const defaultPort = defaultProtocol === 'https' ? '' : `:${config['front-end'].port}`
const defaultAddress = `${defaultProtocol}://${defaultHost}${defaultPort}`

const proxies = {
  internalGetAllRoles (authorizationHeader) {
    return rp({
      method: 'GET',
      uri: `${defaultAddress}/api/v1/roles/internal`,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        'x-request-id': global.requestId,
        Authorization: authorizationHeader
      }
    })
    .then((response) => response.body)
  },

  internalGetRolesByInternalName (authorizationHeader, internalName) {
    return rp({
      method: 'GET',
      uri: `${defaultAddress}/api/v1/roles/internal/by-internal-name`,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        'x-request-id': global.requestId,
        Authorization: authorizationHeader
      },
      qs: {
        internalName
      }
    })
    .then((response) => response.body)
  }
}

module.exports = {
  name: 'roles',
  proxies
}
