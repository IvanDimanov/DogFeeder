'use strict'

const path = require('path')

const koaRouter = require('koa-router')
const redis = require('redis')
const bluebird = require('bluebird')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const {koaJwtMiddleware} = require(`${projectRootPath}/shared-modules/session`)
const {toString, getInstance, jsonParseSafe} = require(`${projectRootPath}/shared-modules/utils`)

const routeName = path.parse(__dirname).name
const apiPrefix = config.services[global.serviceName].routes[routeName].apiPathPrefix
const urlPrefix = `${apiPrefix}/${global.serviceName}/${routeName}`

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('error', (error) => console.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

const koaRoutes = koaRouter({
  /* Resolves to /api/v1/logs/system */
  prefix: urlPrefix
})
  .get('/', koaJwtMiddleware(), function * () {
    let {currentPage, maxResultsPerPage} = this.query

    if (currentPage === undefined) {
      currentPage = 1
    }
    currentPage = Number(currentPage)

    if (currentPage % 1) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidPage',
        errorMessage: `Page must be Integer but same is ${toString(currentPage)}`
      }
      return
    }

    if (currentPage < 1) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidPage',
        errorMessage: `Page must be bigger than 0 but same is ${toString(currentPage)}`
      }
      return
    }

    if (maxResultsPerPage === undefined) {
      maxResultsPerPage = 10
    }
    maxResultsPerPage = Number(maxResultsPerPage)

    const validMaxResultsPerPage = [5, 10, 20, 30]
    if (!~validMaxResultsPerPage.indexOf(maxResultsPerPage)) {
      this.status = 400
      this.body = {
        errorCode: 'InvalidMaxResultsPerPage',
        errorMessage: `Maximum results per page must be one of ${toString(validMaxResultsPerPage)} but same is {${getInstance(maxResultsPerPage)}} "${maxResultsPerPage}"`
      }
      return
    }

    const logs = yield redisClient
      .zrangeAsync('logs', 0, -1)
      .map(jsonParseSafe)

    this.body = {
      currentPage,
      maxResultsPerPage,
      totalResults: logs.length,
      logs: logs.reverse().slice((currentPage - 1) * maxResultsPerPage, currentPage * maxResultsPerPage)
    }
  })

module.exports = koaRoutes
