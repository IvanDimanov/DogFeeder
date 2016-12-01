'use strict'

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

function buildModule (directoryPath) {
  const buildCommand = 'npm run build'
  console.log(`Executing "${buildCommand}" in ${directoryPath}`)

  exec(buildCommand, {cwd: directoryPath}, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: Unable to execute "${buildCommand}" in "${directoryPath}":\n${error}`)
      process.exit(error.code)
    } else if (stderr) {
      console.error(`Error in executing "${buildCommand}" in "${directoryPath}"\n${stderr}`)
    } else {
      console.log(`Output for "${buildCommand}" in "${directoryPath}":${stdout}`)
    }
  })
}

buildModule(path.resolve(__dirname, '../../', 'config'))

fs
  /* Get all possible shared module tools */
  .readdirSync(path.resolve(__dirname, '../../', 'shared-modules'))

  /* Be sure we're dealing only with modules as Directories */
  .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, '../../', 'shared-modules', itemPath)).isDirectory())

  /* Secure consistent order of execution */
  .sort()

  .forEach((itemPath) => buildModule(path.resolve(__dirname, '../../', 'shared-modules', itemPath)))

buildModule(path.resolve(__dirname, '../../', 'database'))

fs
  /* Get all possible Back-end mServices */
  .readdirSync(path.resolve(__dirname, '../../', 'back-end/services'))

  /* Be sure we're dealing only with mService Directories */
  .filter((itemPath) => fs.lstatSync(path.resolve(__dirname, '../../', 'back-end/services', itemPath)).isDirectory())

  /* Secure consistent order of execution */
  .sort()

  .forEach((itemPath) => buildModule(path.resolve(__dirname, '../../', 'back-end/services', itemPath)))

buildModule(path.resolve(__dirname, '../../', 'front-end'))
