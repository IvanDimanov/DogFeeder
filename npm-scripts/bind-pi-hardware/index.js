'use strict'

const exec = require('child_process').exec

/* Those access points are used mainly from "back-end/services/hardware/routes/default/index.js" */
const gpioModulePaths = ['/sys/class/leds/led0', '/dev/ttyAMA0']

function bindModule (modulePath) {
  console.log(`Binding module "${modulePath}"`)
  const bindCommand = `sudo chmod -R 777 ${modulePath}`

  exec(bindCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: Unable to execute "${bindCommand}":\n${error}`)
      process.exit(error.code)
    } else if (stderr) {
      console.error(`Error in executing "${bindCommand}"\n${stderr}`)
    } else {
      console.log(`Output for "${bindCommand}":${stdout}`)
    }
  })
}

Promise.all(gpioModulePaths.map(bindModule))
.then(() => console.log(`All GPIO modules "${gpioModulePaths.join('", "')}" are bound`))
.catch((error) => {
  console.error('Unable to bind GPIO modules because of', error)
  process.exit(1)
})

