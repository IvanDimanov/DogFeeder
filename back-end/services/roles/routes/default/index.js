'use strict'

const path = require('path')

const koaRouter = require('koa-router')
const redis = require('redis')
const bluebird = require('bluebird')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const logger = require(`${projectRootPath}/shared-modules/logger`)
const {koaJwtMiddleware} = require(`${projectRootPath}/shared-modules/session`)
const {toString, jsonParseSafe} = require(`${projectRootPath}/shared-modules/utils`)

const routeName = path.parse(__dirname).name
const apiPrefix = config.services[global.serviceName].routes[routeName].apiPathPrefix
const urlPrefix = `${apiPrefix}/${global.serviceName}`

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('error', (error) => console.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

const koaRoutes = koaRouter({
  /* Resolves to /api/v1/roles */
  prefix: urlPrefix
})
  /* Let the any system microService know which are the exact roles in use */
  .get('/internal', koaJwtMiddleware(), function * () {
    if (!this.state.session.isInternalRequest) {
      logger.error('Attempt to access internal route with session', this.state.session)
      this.status = 401
      this.body = {
        errorCode: 'InternalUseOnly',
        errorMessage: 'This route can be used only internally from the system itself'
      }
      return
    }

    const roles = yield redisClient
      .lrangeAsync('roles', 0, -1)
      .map(jsonParseSafe)

    logger.debug('Successfully found found all system roles', roles)
    this.body = roles
  })

  /* Get complete Role object based on Role internalName */
  .get('/internal/by-internal-name', koaJwtMiddleware(), function * () {
    if (!this.state.session.isInternalRequest) {
      logger.error('Attempt to access internal route with session', this.state.session)
      this.status = 401
      this.body = {
        errorCode: 'InternalUseOnly',
        errorMessage: 'This route can be used only internally from the system itself'
      }
      return
    }

    const {internalName} = this.query
    if (!internalName ||
        typeof internalName !== 'string'
    ) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidInternalName',
        errorMessage: `Invalid query property "internalName": "${toString(internalName)}"`
      }
      return
    }

    const roleStringify = yield redisClient
      .hgetAsync('roles', internalName)

    if (!roleStringify) {
      this.status = 404
      this.body = {
        errorCode: 'RoleByInternalNameNotFound',
        errorMessage: `Role by "internalName": "${toString(internalName)}" was not found`
      }
      return
    }

    const role = jsonParseSafe(roleStringify)

    logger.debug('Successfully found role', role, 'for internalName', internalName)
    this.body = role
  })

module.exports = koaRoutes
