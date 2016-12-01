'use strict'

const path = require('path')

const koaRouter = require('koa-router')
const redis = require('redis')
const bluebird = require('bluebird')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const logger = require(`${projectRootPath}/shared-modules/logger`)
const {toString, jsonParseSafe} = require(`${projectRootPath}/shared-modules/utils`)

const routeName = path.parse(__dirname).name
const apiPrefix = config.services[global.serviceName].routes[routeName].apiPathPrefix
const urlPrefix = `${apiPrefix}/${global.serviceName}/${routeName}`   /* Resolves to /api/v1/logs/system */

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('error', (error) => console.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

const koaRoutes = koaRouter()
  .get(urlPrefix, async function () {
    logger.debug('Getting System logs')

    const logs = await redisClient
      .zrangeAsync('logs', 0, -1)
      .map(jsonParseSafe)

    logger.debug('System Logs returned')

    this.body = logs.reverse().slice(0, 5)
  })

module.exports = koaRoutes
