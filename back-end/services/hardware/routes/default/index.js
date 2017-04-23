'use strict'

const path = require('path')
const exec = require('child_process').exec

const koaRouter = require('koa-router')
const {Board, Led} = require('johnny-five')
const Raspi = require('raspi-io')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const logger = require(`${projectRootPath}/shared-modules/logger`)
const {koaJwtMiddleware} = require(`${projectRootPath}/shared-modules/session`)

const routeName = path.parse(__dirname).name
const apiPrefix = config.services[global.serviceName].routes[routeName].apiPathPrefix
const urlPrefix = `${apiPrefix}/${global.serviceName}`

/**
 * Bind all components as soon as the Board is ready
 * and give access abilities to 'this'
 */
const boardSetupMiddleware = (() => {
  let board
  let isBoardReady = false
  let led

  const bindCommand = 'npm run bind-pi-hardware'
  new Promise((resolve, reject) => exec(bindCommand, {cwd: projectRootPath}, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: Unable to execute "${bindCommand}":\n${error}`)
      reject(error)
    } else if (stderr) {
      console.error(`Error in executing "${bindCommand}"\n${stderr}`)
      reject(stderr)
    } else {
      console.log(`Output for "${bindCommand}":${stdout}`)
      resolve(stdout)
    }
  }))

  .then(() => {
    logger.debug('Setting up Hardware board access')
    board = new Board({
      io: new Raspi(),
      repl: false,
      debug: false
    })

    board.on('ready', function onBoardReady () {
      logger.info('Hardware board ready')
      isBoardReady = true
      led = new Led('P1-11')
    })
  })

  .catch((error) => {
    logger.error('Unable to setup Board', error)
    throw error
  })

  return function * boardSetupMiddleware (next) {
    this.isBoardReady = isBoardReady
    this.board = board
    this.led = led

    yield next
  }
})()

const koaRoutes = koaRouter({
  /* Resolves to /api/v1/hardware */
  prefix: urlPrefix
})
  /*  */
  .post('/test/led/on', koaJwtMiddleware(), boardSetupMiddleware, function * () {
    this.led.on()
    this.body = {
      isLedOn: this.led.isOn
    }
  })

  /*  */
  .post('/test/led/off', koaJwtMiddleware(), boardSetupMiddleware, function * () {
    this.led.off()
    this.body = {
      isLedOn: this.led.isOn
    }
  })

module.exports = koaRoutes
