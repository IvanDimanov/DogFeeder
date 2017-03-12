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
    const {user} = this.state.session

    if (user.role.internalName === 'guestSinger') {
      logger.debug('Return default guest', user)

      this.body = user
      return
    }

    const foundUser = yield serviceProxy
      .users
      .internalGetUserById(getAuthorizationHeader({isInternalRequest: true}), user.id)
      .catch(() => undefined)

    if (!foundUser) {
      logger.error('Unable to find used in DB with userId:', user.Id)
      this.status = 404
      this.body = {
        errorCode: 'UserNotFound',
        errorMessage: `Unable to get User with ID "${user.Id}"`
      }
      return
    }

    logger.debug('Return login User', foundUser)

    this.body = foundUser
  })

  /* Update logged-in user: sex, title */
  .post('/mine', koaJwtMiddleware(), function * () {
    const {user: sessionUser} = this.state.session

    if (!~sessionUser.role.permissions.indexOf('canUpdateProfile')) {
      logger.error(`Permission "canUpdateProfile" not found in`, sessionUser.role.permissions)
      this.status = 403
      this.body = {
        errorCode: 'NoUpdatePermission',
        errorMessage: 'You have no permission to update your profile'
      }
      return
    }

    const foundUserStringify = yield redisClient.hgetAsync('users', sessionUser.id)
    const foundUser = jsonParseSafe(foundUserStringify)
    delete foundUser.encryptedPassword

    if (!foundUser) {
      logger.error('Unable to find used in DB with userId:', sessionUser.id)
      this.status = 404
      this.body = {
        errorCode: 'UserNotFound',
        errorMessage: `User with userId "${sessionUser.id}" is not found`
      }
      return
    }

    const {user: updateUser} = this.request.body

    const validSexes = ['male', 'female']
    if (!~validSexes.indexOf(updateUser.sex)) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidUserSex',
        errorMessage: `"${toString(updateUser.sex)}" is not one of ${toString(validSexes)}`
      }
      return
    }

    updateUser.title = String(updateUser.title).trim()
    if (updateUser.title.replace(/[^a-zA-Z]/g, '').length < 2) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidUserTitle',
        errorMessage: 'Title must have more than 2 letters'
      }
      return
    }

    foundUser.sex = updateUser.sex
    foundUser.title = updateUser.title

    yield redisClient.hsetAsync('users', sessionUser.id, JSON.stringify(foundUser))

    /**
     * We need to enrich 'foundUser' object 'role' property
     * coz it contains only {role: {internalName: '???'}}
     */
    foundUser.role = yield serviceProxy
      .roles
      .internalGetRolesByInternalName(getAuthorizationHeader({isInternalRequest: true}), foundUser.role.internalName)

    this.body = foundUser
  })

  /* Update logged-in user: password */
  .post('/mine/password', koaJwtMiddleware(), function * () {
    const {user} = this.state.session

    if (!~user.role.permissions.indexOf('canUpdatePassword')) {
      logger.error(`Permission "canUpdatePassword" not found in`, user.role.permissions)
      this.status = 403
      this.body = {
        errorCode: 'NoUpdatePermission',
        errorMessage: 'You have no permission to update your password'
      }
      return
    }

    function getPasswordStrongLevel (password) {
      password = String(password)

      let level = 0
      const labels = [
        '',
        'Lame',
        'Silly',
        'You can do better',
        'Now we`re talking',
        'That`s good enough',
        'Добре си вече, стига',
        'Ей програмистче малко',
        'Ти сигурен ли си, че ще я запомниш',
        'СУПЕР МАРИО!',
        'Евала - признах тъ',
        'СПАРТААААА!',
        'За кракта ти безкрайни...',
        '... 6! 6! 6!'
      ]

      const styles = [
        {},
        {color: 'green'},
        {color: 'green'},
        {color: 'lime'},
        {color: 'lime'},
        {color: 'yellow'},
        {color: 'yellow'},
        {color: 'orange', fontWeight: 'bold'},
        {color: 'orange', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'},
        {color: 'red', fontWeight: 'bolder'}
      ]

      if (password.length > 0) level++
      if (password.length > 5) level++
      if (password.length > 10) level++
      if (password.length > 15) level++
      if (password.length > 20) level++

      if (password.match(/[0-9]/)) level++
      if (password.match(/[a-z]/)) level++
      if (password.match(/[A-Z]/)) level++

      if (password.match(/[!@#$%\\^]/)) level++
      if (password.match(/[&*()_+-=]/)) level++
      if (password.match(/[/\\]/)) level++
      if (password.match(/[\\[\]\\{\\}]/)) level++
      if (password.match(/[';|.,]/)) level++

      return {
        level,
        label: labels[level],
        style: styles[level]
      }
    }

    const {password} = this.request.body

    if (getPasswordStrongLevel(password).level < 4) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidPassword',
        errorMessage: 'Please send a stronger Password'
      }
      return
    }

    const encryptedPassword = yield serviceProxy
      .auth
      .internalEncrypt(getAuthorizationHeader({isInternalRequest: true}), password)
      .then((response) => response.encryptedText)

    const foundUserStringify = yield redisClient.hgetAsync('users', user.id)
    const foundUser = jsonParseSafe(foundUserStringify)

    if (!foundUser) {
      logger.error('Unable to find used in DB with userId:', user.id)
      this.status = 404
      this.body = {
        errorCode: 'UserNotFound',
        errorMessage: `User with userId "${user.id}" is not found`
      }
      return
    }

    /* Recreate new User/Password relation */
    yield redisClient.hdelAsync('userAuthToId', `${foundUser.name}/${foundUser.encryptedPassword}`)
    yield redisClient.hsetAsync('userAuthToId', `${foundUser.name}/${encryptedPassword}`, foundUser.id)

    foundUser.encryptedPassword = encryptedPassword
    yield redisClient.hsetAsync('users', foundUser.id, JSON.stringify(foundUser))

    delete foundUser.encryptedPassword

    /**
     * We need to enrich 'foundUser' object 'role' property
     * coz it contains only {role: {internalName: '???'}}
     */
    foundUser.role = yield serviceProxy
      .roles
      .internalGetRolesByInternalName(getAuthorizationHeader({isInternalRequest: true}), foundUser.role.internalName)

    this.body = foundUser
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
