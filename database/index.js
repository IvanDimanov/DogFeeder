'use script'

const fs = require('fs')
const path = require('path')

const uuid = require('uuid/v4')
const redis = require('redis')
const bluebird = require('bluebird')

const config = require('../config')
const logger = require('../shared-modules/logger')
const {toString} = require('../shared-modules/utils')

/* Used in logging */
global.serviceName = 'DB Migrate Up'
global.instanceId = 1
global.requestId = uuid()

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

/* Use Promises instead of callbacks: http://redis.js.org/#redis-a-nodejs-redis-client-usage-example-promises */
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('ready', () => logger.debug(`Redis connection established to ${toString(dbConfig)}`))
redisClient.on('error', (error) => logger.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

/* Get a descriptive description on
   - which migrations we have saved in files
   - which of those are already migrated
   - which needs to be migrated
*/
;(async function main () {
  const migrationPaths = fs
    /* Get all possible migration scripts */
    .readdirSync(path.resolve(__dirname, './migrations'))

    /* Be sure we're dealing only with migration Files */
    .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, './migrations', itemPath)).isFile())

    /* Secure consistent order of execution */
    .sort()

  const alreadyCompletedMigrations = await redisClient
    .lrangeAsync('migrations', 0, -1)

  /* Be sure that all previously executed Migrations are still available as a source */
  alreadyCompletedMigrations
    .forEach((itemPath) => {
      try {
        fs.lstatSync(path.resolve(__dirname, './migrations', itemPath)).isFile()
      } catch (error) {
        throw new ReferenceError(`Cannot access file for already completed Migration "${itemPath}": ${error}`)
      }
    })

  const tobeMigratedPaths = migrationPaths
    .filter((itemPath) => !~alreadyCompletedMigrations.indexOf(itemPath))

  logger.debug('File migrations:', migrationPaths)
  logger.debug('Already migrated:', alreadyCompletedMigrations)
  logger.debug('Tobe migrated:', tobeMigratedPaths)

  return tobeMigratedPaths
})()

/* Start migrating one-by-one the scripts that are missed in the DB */
.then((tobeMigratedPaths) => Promise.all(tobeMigratedPaths
  .map((itemPath) => {
    const migration = require(path.resolve(__dirname, './migrations', itemPath))
    return migration
      .up(redisClient)
      .then(() => {
        logger.debug('Successfully migrated:', itemPath)
        /* Be sure not to migrate the same script again */
        return redisClient.rpushAsync('migrations', itemPath)
      })
  }))
)

.then(() => logger.info('All migrations successfully completed'))
.catch((error) => logger.error(`Error while executing migrations: ${toString(error)}`))

/* No need to keep the Redis connection open for this module or any other required modules like 'logger' */
.then(process.exit)
