'use strict'

const path = require('path')

const koaRouter = require('koa-router')

const projectRootPath = '../../../../../'
const config = require(`${projectRootPath}/config`)
const {koaJwtMiddleware} = require(`${projectRootPath}/shared-modules/session`)

const routeName = path.parse(__dirname).name
const apiPrefix = config.services[global.serviceName].routes[routeName].apiPathPrefix
const urlPrefix = `${apiPrefix}/${global.serviceName}`

/* Handles all GPIO modules that are bound to the Pi Board */
const boardSetupMiddleware = require('./board-middleware')

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
