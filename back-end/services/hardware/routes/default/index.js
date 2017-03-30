'use strict'

const path = require('path')

const koaRouter = require('koa-router')
const {Board, Led} = require('johnny-five')

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
  logger.debug('Setting up Hardware board access')
  const board = new Board()
  let isBoardReady = false
  let led

  board.on('ready', function onBoardReady () {
    logger.info('Hardware board ready')
    isBoardReady = true
    led = new Led('P1-17')
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
