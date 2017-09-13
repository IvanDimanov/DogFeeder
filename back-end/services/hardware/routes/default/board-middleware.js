'use strict'

const exec = require('child_process').exec

const { Board, Relay } = require('johnny-five')
const Raspi = require('raspi-io')

/* Some hardware like Leds needs to have permissions set as GPIO modules */
;(() => {
  const gpioModulePaths = ['/sys/class/leds/led0', '/dev/ttyAMA0']

  function bindModule (modulePath) {
    console.log(`Binding module "${modulePath}"`)
    const bindCommand = `sudo chmod -R 777 ${modulePath}`

    return new Promise((resolve, reject) => exec(bindCommand, (error, stdout, stderr) => {
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
  }

  /* Mange all needed permissions for binding GPIO modules */
  Promise.all(gpioModulePaths.map(bindModule))
  .then(() => console.log(`All GPIO modules "${gpioModulePaths.join('", "')}" are bound`))
  .catch((error) => {
    console.error('Unable to bind GPIO modules because of', error)
    process.exit(1)
  })
})()

/**
 * Bind all components as soon as the Board is ready
 * and give access abilities to 'this'
 */
const boardSetupMiddleware = (() => {
  const board = new Board({
    io: new Raspi(),
    repl: false,
    debug: false
  })
  let isBoardReady = false
  let relay

  board.on('ready', function onBoardReady () {
    isBoardReady = true
    relay = new Relay(7)
  })

  return function * boardSetupMiddleware (next) {
    this.isBoardReady = isBoardReady
    this.board = board
    this.relay = relay

    yield next
  }
})()

module.exports = boardSetupMiddleware
