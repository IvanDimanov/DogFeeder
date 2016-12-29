'use strict'

const fs = require('fs')
const path = require('path')

const jwtSimple = require('jwt-simple')
const jwtMiddleware = require('koa-jwt')

const projectRootPath = '../../'
const config = require(`${projectRootPath}/config`)

const jwtSecretsFilePath = path.resolve(__dirname, projectRootPath, 'config/secrets', config.services.auth.jwtSecretsFileName)
let jwtSecret

try {
  jwtSecret = fs.readFileSync(jwtSecretsFilePath, 'utf-8')
} catch (error) {
  throw new ReferenceError(`Unable to read JWT secret from file "${jwtSecretsFilePath}"`)
}

function koaJwtMiddleware () {
  return jwtMiddleware({
    secret: jwtSecret,
    key: 'session'
  })
}

function getAuthorizationHeader (data) {
  return `Bearer ${jwtSimple.encode(data, jwtSecret)}`
}

function getAuthorizationHeaderForUser (user) {
  return getAuthorizationHeader({
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    },
    exp: Math.round((Date.now() + config.services.auth.maxTokenLifeTimestamp) / 1000)
  })
}

module.exports = {
  koaJwtMiddleware,
  getAuthorizationHeader,
  getAuthorizationHeaderForUser
}
