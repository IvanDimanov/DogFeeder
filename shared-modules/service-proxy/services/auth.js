'use strict'

const rp = require('request-promise')
const config = require('../../../config')

const defaultProtocol = config['front-end'].protocol
const defaultHost = config['front-end'].host
const defaultPort = defaultProtocol === 'https' ? '' : `:${config['front-end'].port}`
const defaultAddress = `${defaultProtocol}://${defaultHost}${defaultPort}`

const proxies = {
  internalGetSingerByLyrics (authorizationHeader, lyrics) {
    return rp({
      method: 'GET',
      uri: `${defaultAddress}/api/v1/auth/internal/singer/by-lyrics`,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        'x-request-id': global.requestId,
        Authorization: authorizationHeader
      },
      qs: {
        lyrics
      }
    })
    .then((response) => response.body)
  }
}

module.exports = {
  name: 'auth',
  proxies
}
