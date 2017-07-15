'use strict'

const os = require('os')

const uuid = require('uuid/v4')
const bytes = require('bytes')
const prettyHrtime = require('pretty-hrtime')

const redis = require('redis')
const bluebird = require('bluebird')

const config = require('../../config')
const {toString} = require('../utils')

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

/* Use Promises instead of callbacks: http://redis.js.org/#redis-a-nodejs-redis-client-usage-example-promises */
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('error', (error) => logger.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

const serverId = `${os.hostname()} - ${os.type()}/${os.release()}`

async function custom (type, ...messages) {
  type = toString(type)
  const message = messages
    .map(toString)
    .join(' ')

  const date = new Date()
  const createdAt = date.toISOString()
  const log = {
    type,
    message,
    createdAt,
    serverId,
    serviceName: global.serviceName,
    instanceId: global.instanceId,
    requestId: global.requestId
  }

  /* Have it in the console as a backup */
  console.log(createdAt, log)

  /* Keep all logs into sorted set so we can easily paginate or filter by date */
  await redisClient
    .zaddAsync('logs', date.getTime(), toString(log))
}

/* Tracks In & Out requests to a koa server using the local 'logger.*' functions */
/* Inspired by https://github.com/koajs/logger/blob/master/index.js */
function * koaMiddleware (next) {
  const start = process.hrtime()

  global.requestId = this.request.header['x-request-id'] || uuid()
  this.set('x-request-id', global.requestId)

  logger.info(`<-- ${this.method} ${this.originalUrl}`)

  try {
    yield next
  } catch (error) {
    const length = this.response.length
    const end = process.hrtime(start)
    const humanTotalTime = prettyHrtime(end).replace(' ', '')

    const errorUuid = uuid()
    this.status = error.status || 500
    this.body = {
      errorCode: 'InternalServerError',
      errorMessage: error.message || 'We are unable to proceed with your request. Please excuse us and try again later.',
      errorUuid
    }

    /* Log uncaught downstream errors */
    logger.error('Internal Service Error', errorUuid, error.stack)
    logger.error(`--> ${this.method} ${this.originalUrl} ${error.status || 500} ${humanTotalTime} ${length ? bytes(length) : ''}`)

    return
  }

  const length = this.response.length
  const end = process.hrtime(start)
  const humanTotalTime = prettyHrtime(end).replace(' ', '')

  logger.info(`--> ${this.method} ${this.originalUrl} ${this.status || 500} ${humanTotalTime} ${length ? bytes(length) : ''}`)
}

/* Tracks In requests to a express server using the local 'logger.*' functions */
function expressMiddlewareBeforeAll (request, response, next) {
  const startTime = process.hrtime()

  global.requestId = request.header['x-request-id'] || uuid()
  response.set('x-request-id', global.requestId)
  request.startTime = startTime

  logger.info(`<-- ${request.method} ${request.originalUrl} ${JSON.stringify(request.body || {})}`)

  next()
}

/* Tracks Out requests to a express server using the local 'logger.*' functions */
function expressMiddlewareAfterAll (request, response, error) {
  const endTime = process.hrtime(request.startTime)
  const humanTotalTime = prettyHrtime(endTime).replace(' ', '')

  if (!error) {
    logger.info(`--> ${request.method} ${request.originalUrl} ${response.statusCode || 500} ${humanTotalTime}`)
    return
  }

  const errorUuid = uuid()
  response
    .status(error.status || 500)
    .send({
      errorCode: 'InternalServerError',
      errorMessage: error.message || 'We are unable to proceed with your request. Please excuse us and try again later.',
      errorUuid
    })

  /* Log uncaught downstream errors */
  logger.error('Internal Service Error', errorUuid, error.stack)
  logger.error(`--> ${request.method} ${request.originalUrl} ${error.status || 500} ${humanTotalTime}`)
}

const logger = {
  custom,
  silly: async (...messages) => custom('silly', ...messages),
  debug: async (...messages) => custom('debug', ...messages),
  info: async (...messages) => custom('info', ...messages),
  warn: async (...messages) => custom('warning', ...messages),
  warning: async (...messages) => custom('warning', ...messages),
  error: async (...messages) => custom('error', ...messages),

  koaMiddleware,
  expressMiddlewareBeforeAll,
  expressMiddlewareAfterAll
}

module.exports = logger
