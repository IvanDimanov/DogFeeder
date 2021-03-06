'use strict'

const rp = require('request-promise')
const config = require('../../../config')

const defaultProtocol = config['front-end'].protocol
const defaultHost = config['front-end'].host
const defaultPort = defaultProtocol === 'https' ? '' : `:${config['front-end'].port}`
const defaultAddress = `${defaultProtocol}://${defaultHost}${defaultPort}`

const proxies = {
  internalGetUserById (authorizationHeader, userId) {
    return rp({
      method: 'GET',
      uri: `${defaultAddress}/api/v1/users/internal/by-id`,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        'x-request-id': global.requestId,
        Authorization: authorizationHeader
      },
      qs: {
        userId
      }
    })
    .then((response) => response.body)
  }
}

module.exports = {
  name: 'users',
  proxies
}
