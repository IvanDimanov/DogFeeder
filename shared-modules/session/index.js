'use strict'

const fs = require('fs')
const path = require('path')

const jwtSimple = require('jwt-simple')
const koaJwt = require('koa-jwt')
const expressJwt = require('express-jwt')

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
  return koaJwt({
    secret: jwtSecret,
    key: 'session'
  })
}

function expressJwtMiddleware (options) {
  return expressJwt(Object.assign({}, options, { secret: jwtSecret }))
}

function getAuthorizationHeader (data) {
  return `Bearer ${jwtSimple.encode(data, jwtSecret)}`
}

function getAuthorizationHeaderForUser (user) {
  return getAuthorizationHeader({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      sex: user.sex,
      title: user.title
    },
    exp: Math.round((Date.now() + config.services.auth.maxTokenLifeTimestamp) / 1000)
  })
}

module.exports = {
  koaJwtMiddleware,
  expressJwtMiddleware,
  getAuthorizationHeader,
  getAuthorizationHeaderForUser
}
