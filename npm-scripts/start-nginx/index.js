/*
  This builds nginx configuration file out of 'config' module,
  saves it in 'nginxConfigFilePath' and
  try to start nginx with it
*/
'use strict'

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

const config = require('../../config')

const nginxConfigFilePath = path.resolve(__dirname, 'nginx.conf')

const webServicesNames = Object.keys(config.services)
  .filter((name) => config.services[ name ].publiclyAccessedRoutes.length)

function getLoadBalancerServersTemplate (seviceName, serviceConfig) {
  function getServers () {
    return Array.from({length: serviceConfig.totalInitialInstances})
      .map((value, instancePort) => `    server ${config['front-end'].host}:${serviceConfig.defaultPort + instancePort};`)
      .join(`
`)
  }

  return `
  upstream ${seviceName}-balancer {
    least_conn;
${getServers()}
  }`
}

function getLoadBalancerLocationTemplates (seviceName, serviceConfig) {
  function getLocation (route) {
    return `
    location ~ ^${route}(.*)$ {
      proxy_pass http://${seviceName}-balancer$uri;
    }`
  }

  return serviceConfig.publiclyAccessedRoutes
    .map(getLocation)
    .join(`
`)
}

console.log(`Creating nginx config ${nginxConfigFilePath}`)

let template = `
# Defaults to number of CPUs
worker_processes auto;

events {
  # Total active connections per worker; correlate to total number of open files
  worker_connections 512;
}

http {
  log_format compression '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $body_bytes_sent '
                         '"$http_referer" "$gzip_ratio"';

  # Return common MIME types for files such as CSS and JS
  include ${path.resolve(__dirname, 'mime.types')};

  # List of servers that will handle the microService
${webServicesNames
  .map((seviceName) => getLoadBalancerServersTemplate(seviceName, config.services[seviceName]))
  .join(`
  `)
}

  # Main ${config['front-end'].host}:${config['front-end'].port} traffic router
  server {
    root ${path.resolve(__dirname, '../..')};

    access_log ${path.resolve(__dirname, 'nginx-access.log')} compression;
    error_log ${path.resolve(__dirname, 'nginx-error.log')};

    listen ${config['front-end'].port};
    client_max_body_size 2M;
    server_name localhostServer;

    # Redirect to load-balancer
${webServicesNames
  .map((seviceName) => getLoadBalancerLocationTemplates(seviceName, config.services[seviceName]))
  .join(`
  `)
}

    # Static/public files (HTML, JS, CSS)
    location / {
      try_files $uri $uri/ /front-end/public/$uri /front-end/public/$uri/;
    }
  }
}`

/* Safe paths on non-Unix systems */
template = template.replace(/\\/g, '\\\\')

fs.writeFileSync(nginxConfigFilePath, template, 'utf-8')

console.log(`nginx config ${nginxConfigFilePath} successfully created`)

console.log('Stopping nginx')
new Promise((resolve, reject) => {
  const command = 'nginx -s stop'
  console.log(command)
  exec(command, (/* error, stdout, stderr */) => resolve())
})

.then(() => console.log(`Starting nginx with config ${nginxConfigFilePath}`))
.then(() => new Promise((resolve, reject) => {
  const command = `nginx -c ${nginxConfigFilePath}`
  console.log(command)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error in starting nginx with command "${command}": ${error}`)
      process.exit(error.code)
    }

    if (stderr) {
      console.error(`Error executing command "${command}": ${stderr}`)
      process.exit(1)
    }

    console.log('nginx successfully started')
    resolve()
  })
}))
