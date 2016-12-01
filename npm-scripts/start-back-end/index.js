'use strict'

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

const config = require('../../config')

const configFilePath = './pm2-ecosystem.json'

/* Be sure to clear all traces of old version service progress - logs should be already saved */
function deleteAllService () {
  function deleteService (name) {
    return new Promise((resolve, reject) => {
      const command = `pm2 delete ${name}`
      console.log(command)
      exec(command, (/* error, stdout, stderr */) => {
        /*
          Output and errors may greatly very duo to pm2 execution but
          still the service could be deleted
        */
        resolve()
      })
    })
  }

  return Promise.all(Object.keys(config.services)
    .map(deleteService)
  )
}

/* Create a single JSON file that will be used from PM2 to determine all mServices clustering props */
function createServiceConfig () {
  console.log(`Creating ${configFilePath}`)

  const content = {
    apps: []
  }

  function addServiceConfig (name) {
    return new Promise((resolve, reject) => {
      content.apps.push({
        name,
        script: 'index.js',
        node_args: '--harmony_async_await',
        cwd: path.resolve(__dirname, '../../back-end/services', name),
        instances: config.services[name].totalInitialInstances,
        max_restarts: 15,
        env: {
          NODE_ENV: process.env.NODE_ENV
        }
      })

      resolve()
    })
  }

  return Promise.all(Object.keys(config.services)
    .map(addServiceConfig)
  )
  .then(() => fs.writeFileSync(
    path.resolve(__dirname, configFilePath),
    JSON.stringify(content, undefined, 2),
    'utf8'
  ))
  .then(() => console.log(`${configFilePath} successfully created`))
}

/* Use the configuration file to start pm2 clusters in respect for each service */
function startWithServiceConfig () {
  return new Promise((resolve, reject) => {
    const command = `pm2 start ${path.resolve(__dirname, configFilePath)}`
    console.log(command)
    exec(command, (error, stdout, stderr) => {
      /*
        We won't stop the process executing 'reject()' since
        having error starting a single service
        should not stop the starting of others
      */

      if (error) {
        console.error(`Error in starting service "${'json config'}" with command "pm2": ${error}`)
      }

      if (stderr) {
        console.error(`Error executing command "pm2" for service "${'json config'}": ${stderr}`)
      }

      console.log('pm2 successfully started')
      resolve()
    })
  })
}

/* Mange the entire process flow */
deleteAllService()
  .then(createServiceConfig)
  .then(startWithServiceConfig)
  .catch((error) => console.error(`Error in restarting all services: ${error}`))
