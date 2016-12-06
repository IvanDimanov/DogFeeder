'use script'

const fs = require('fs')
const path = require('path')

const uuid = require('node-uuid')
const redis = require('redis')
const bluebird = require('bluebird')

const config = require('../config')
const logger = require('../shared-modules/logger')
const {toString} = require('../shared-modules/utils')

/* Used in logging */
global.serviceName = 'DB Migrate Down'
global.instanceId = 1
global.requestId = uuid.v4()

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

/* Use Promises instead of callbacks: http://redis.js.org/#redis-a-nodejs-redis-client-usage-example-promises */
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('ready', () => logger.debug(`Redis connection established to ${toString(dbConfig)}`))
redisClient.on('error', (error) => logger.error(`Error while running Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

const migrationPath = process.argv[2]
;(async function main () {
  if (!migrationPath) {
    throw new ReferenceError(`No migration path found. Example of correct usage "node migrate-down 0-setup.js"`)
  }

  try {
    fs.lstatSync(path.resolve(__dirname, './migrations', migrationPath)).isFile()
  } catch (error) {
    throw new ReferenceError(`Unable to access migration file "${migrationPath}": ${toString(error)}`)
  }

  const alreadyCompletedMigrations = await redisClient
    .lrangeAsync('migrations', 0, -1)

  const migrationIndex = alreadyCompletedMigrations.indexOf(migrationPath)
  if (!~migrationIndex) {
    throw new ReferenceError(`File "${migrationPath}" was not migrated into DB ${toString(dbConfig)}`)
  }

  return alreadyCompletedMigrations
    .slice(migrationIndex)
    .reverse()
})()

/* Start downgrading migrations one-by-one so we can have the DB back to its expected state */
.then((tobeDowngradedPaths) => Promise.all(tobeDowngradedPaths
  .map((itemPath) => {
    const migration = require(path.resolve(__dirname, './migrations', itemPath))
    return migration
      .down(redisClient)
      .then(() => {
        logger.debug('Successfully downgraded migration:', itemPath)
        /* Be sure not to downgraded the migrate the same script again */
        return redisClient.lremAsync('migrations', 0, itemPath)
      })
  }))
)

.then(() => logger.info(`Downgrading to migration "${migrationPath}" successfully completed`))
.catch((error) => logger.error(`Error in downgrading migration: ${toString(error)}`))

/* No need to keep the Redis connection open */
.then(process.exit)
