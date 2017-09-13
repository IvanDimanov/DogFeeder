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
  /* Start rolling the food down the line */
  .post('/relay/on', koaJwtMiddleware(), boardSetupMiddleware, function * () {
    this.relay.on()
    this.body = {
      isRelayOn: this.relay.isOn
    }
  })

  /* Stop rolling the food down the line */
  .post('/relay/off', koaJwtMiddleware(), boardSetupMiddleware, function * () {
    this.relay.off()
    this.body = {
      isRelayOn: this.relay.isOn
    }
  })

module.exports = koaRoutes
