'use strict'

const path = require('path')

const koaRouter = require('koa-router')
const redis = require('redis')
const bluebird = require('bluebird')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const logger = require(`${projectRootPath}/shared-modules/logger`)
const serviceProxy = require(`${projectRootPath}/shared-modules/service-proxy`)
const {koaJwtMiddleware, getAuthorizationHeader} = require(`${projectRootPath}/shared-modules/session`)
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
  /* Resolves to /api/v1/users */
  prefix: urlPrefix
})
  /* Logged-in user: name, role, permissions, etc. */
  .get('/mine', koaJwtMiddleware(), function * () {
    const user = this.state.session
    logger.info('Return User', user)
    this.body = user
  })

  /* Let internal system calls get full user info for known user ID */
  .get('/internal/by-id', koaJwtMiddleware(), function * () {
    if (!this.state.session.isInternalRequest) {
      logger.error('Attempt to access internal route with session', this.state.session)
      this.status = 401
      this.body = {
        errorCode: 'InternalUseOnly',
        errorMessage: 'This route can be used only internally from the system itself'
      }
      return
    }

    const {userId} = this.query
    if (!userId ||
        typeof userId !== 'string'
    ) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidUserId',
        errorMessage: `Invalid query property "userId": "${toString(userId)}"`
      }
      return
    }

    const foundUserStringify = yield redisClient.hgetAsync('users', userId)
    const foundUser = jsonParseSafe(foundUserStringify)

    if (!foundUser) {
      logger.error('Unable to find used in DB with userId:', userId)
      this.status = 404
      this.body = {
        errorCode: 'UserNotFound',
        errorMessage: `User with userId "${userId}" is not found`
      }
      return
    }

    /* Just for security */
    delete foundUser.encryptedPassword

    /**
     * We need to enrich 'foundUser' object 'role' property
     * coz it contains only {role: {internalName: '???'}}
     */
    foundUser.role = yield serviceProxy
      .roles
      .internalGetRolesByInternalName(getAuthorizationHeader({isInternalRequest: true}), foundUser.role.internalName)

    logger.debug(`Return user for userId "${userId}"`, foundUser)

    this.body = foundUser
  })

module.exports = koaRoutes
