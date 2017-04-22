'use strict'

process.env.NODE_ENV = 'local'

const redis = require('redis')
const bluebird = require('bluebird')

const config = require('./config')
const {toString} = require('./shared-modules/utils')

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

/* Use Promises instead of callbacks: http://redis.js.org/#redis-a-nodejs-redis-client-usage-example-promises */
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('error', (error) => console.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

/**
redisClient
  .keys('*', (error, keys) => {
    error && console.log(error)

    console.log(keys)
  })
/**/

/**
redisClient
  .zrangeAsync('greatSingers', 0, -1)
  .map((greatSinger) => redisClient.zremAsync('greatSingers', greatSinger))
/**/

/**
redisClient
  .llenAsync('migrations')
  .then((totalRoles) => {
    redisClient.ltrimAsync('migrations', totalRoles)
  })
/**/

/**
redisClient
  .lrange('migrations', 0, -1, (error, migrations) => console.log(error, migrations))
/**/

/**
const crypto = require('crypto')

const secret = 'LKNUYI&%adsf&I O:J"W :654+684907(*^&*$C yiu^RU'
const hash = crypto.createHmac('sha256', secret)
                   .update('*(&hn6H0-')
                   .digest('hex')
console.log(hash)
/**/

/**
redisClient
  .zcountAsync('logs', -Infinity, +Infinity)
  .then((logs) => console.log( logs ))
/**/

/**
const totalResults = 31

const currentPage = 10
const maxResultsPerPage = 5

const maxLimit = (totalResults - 1) - maxResultsPerPage * (currentPage - 1)
const minLimit = (totalResults - 1) - maxResultsPerPage * currentPage + 1

console.log(minLimit, maxLimit)
redisClient
  .zrangeAsync('logs', Math.max(0, minLimit), Math.max(0, maxLimit))

  .map((log) => JSON.parse(log))
  .map((log) => log.createdAt)
  .then((logs) => console.log( logs ))

  .then(process.exit)
/**/
