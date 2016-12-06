'use strict'

const path = require('path')

const koaRouter = require('koa-router')
const redis = require('redis')
const bluebird = require('bluebird')
const serp = require('serp')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const logger = require(`${projectRootPath}/shared-modules/logger`)
const serviceProxy = require(`${projectRootPath}/shared-modules/service-proxy`)
const {koaJwtMiddleware, getAuthorizationHeader, getAuthorizationHeaderForUser} = require(`${projectRootPath}/shared-modules/session`)
const {toString, jsonParseSafe} = require(`${projectRootPath}/shared-modules/utils`)

const routeName = path.parse(__dirname).name
const apiPrefix = config.services[global.serviceName].routes[routeName].apiPathPrefix
const urlPrefix = `${apiPrefix}/${global.serviceName}`

const dbConfig = config.database.redis
const redisClient = redis.createClient(dbConfig.port, dbConfig.host)

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

redisClient.on('error', (error) => console.error(`Error while setting Redis with connection ${toString(dbConfig)}: ${toString(error)}`))

/*
  Use Google as our internal search engine so we can use the Internet
  as our info library for every 'search' we are interested in
*/
function searchTheWeb (search) {
  /* Complete description of these 'options' can be found here: https://www.npmjs.com/package/serp#retry-if-error */
  const options = {
    host: 'google.com',
    qs: {
      q: String(search)
    },
    retry: 3,
    num: 5
  }

  return new Promise((resolve, reject) => serp.search(options, (error, results) => {
    if (error) {
      return reject(error)
    } else {
      return resolve(results)
    }
  }))
}

const koaRoutes = koaRouter({
  /* Resolves to /api/v1/auth */
  prefix: urlPrefix
})
  /*
    Perform a Safe Internet search for the incoming 'lyrics' and
    return a possible match from our DB 'greatSingers'
  */
  .get('/internal/singer/by-lyrics', koaJwtMiddleware(), function * () {
    if (!this.state.session.isInternalRequest) {
      logger.error('Attempt to access internal route with session', this.state.session)
      this.status = 401
      this.body = {
        errorCode: 'InternalUseOnly',
        errorMessage: 'This route can be used only internally from the system itself'
      }
      return
    }

    const {lyrics} = this.query

    logger.debug('Try to find "great singer" for lyrics:', lyrics)

    if (!lyrics ||
        typeof lyrics !== 'string'
    ) {
      logger.error('Invalid "lyrics" parameter')
      this.status = 400
      this.body = {
        errorCode: 'UserInputError',
        errorMessage: 'Invalid "lyrics" parameter'
      }
      return
    }

    logger.debug('Try to find the exact system Role "great singer" uses for login')
    const singerRole = yield serviceProxy
      .roles
      .internalGetAllRoles(getAuthorizationHeader({isInternalRequest: true}))
      .reduce((singerRole, currentRole) => currentRole.internalName === 'guestSinger' ? currentRole : singerRole, {})

    logger.debug('"Great singer" system Role found:', singerRole)

    const greatSingers = yield (() => {
      logger.debug('Loading all "great singers" from DB')
      let singerData = ''
      return redisClient
        .zrangeAsync('greatSingers', 0, -1, 'WITHSCORES')

        /* Convert ['{A}', '1', 'B', '2', ...]  => [{name: 'A', level: 1}, {name: 'B', level: 2}, ...] */
        .reduce((accumulator, currentValue, currentIndex) => {
          if (currentIndex % 2) {
            accumulator.push(Object.assign(
              {
                role: singerRole,
                level: parseInt(currentValue)
              },
              singerData
            ))
          } else {
            singerData = jsonParseSafe(currentValue) || {}
          }
          return accumulator
        }, [])
    })()

    /* Greatest singers to be 1st */
    greatSingers.sort((singer1, singer2) => singer2.level - singer1.level)

    /* Be sure no one can Search for the Singer directly */
    /* Converts "Mile Kitic - Kilo Gore Kilo dole"  =>  "- Kilo Gore Kilo dole" */
    const safeLyrucs = greatSingers
      .reduce((safeLyrucs, singer) => safeLyrucs.replace(new RegExp(singer.name, 'ig'), ''), lyrics)
      .replace(/\s+/g, ' ')
      .trim()

    logger.debug('Searching the Web with safe lyrics', safeLyrucs)
    const webResults = yield searchTheWeb(safeLyrucs)
    const webResultsString = toString(webResults).toUpperCase()

    const foundGreatSinger = greatSingers
      .find((singer) => webResultsString.indexOf(singer.name) !== -1)

    if (!foundGreatSinger) {
      logger.info('No "great singer" found for lyrics:', lyrics)
      this.status = 404
      this.body = {}
      return
    }

    logger.info('Successfully found "great singer"', foundGreatSinger, 'for lyrics:', lyrics)
    this.body = foundGreatSinger
  })

  /* Give any user a change to prove he knows a Great Singer hence deserve to login into our system */
  .post('/singer', function * () {
    const {lyrics} = this.request.body

    logger.debug('Try to login as a "great singer" with lyrics:', lyrics)

    if (!lyrics ||
        typeof lyrics !== 'string'
    ) {
      logger.error('Invalid "lyrics" parameter')
      this.status = 400
      this.body = {
        errorCode: 'UserInputError',
        errorMessage: 'Invalid "lyrics" parameter'
      }
      return
    }

    let singer
    try {
      singer = yield serviceProxy
        .auth
        .internalGetSingerByLyrics(getAuthorizationHeader({isInternalRequest: true}), lyrics)
    } catch (errorResponse) {
      if (errorResponse.statusCode === 404) {
        this.status = 404
        this.body = {
          errorCode: 'NoSingerForLyrics',
          errorMessage: `We coudn't find Great Singer that sing lyrics: ${lyrics}`
        }
        return
      }

      this.status = 400
      this.body = {
        errorCode: 'FailedToGetSingerForLyrics',
        errorMessage: 'We cannot login you as a Great Singer at the moment. Please excuse us and try again later.'
      }
      return
    }

    logger.debug(`Login as Great Singer ${singer.name} because of lyrics "${lyrics}"`)

    this.set('Authorization', getAuthorizationHeaderForUser(singer))
    this.body = singer
  })

module.exports = koaRoutes
