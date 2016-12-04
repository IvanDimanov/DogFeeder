/* global $ __CONFIG__ */
'use strict'

import {Observable} from 'rxjs'

const config = __CONFIG__

function ajax (options) {
  return Observable.create((observer) => {
    /* If the App is been developed separately (on a different port) we need to make sue that we still use the default FE gateway */
    /* NODE: CORS should be enabled on the BE */
    if (config.environment === 'local') {
      /* Clears possible issues like "http://localhost:8000//api/v1//test"  =>  "http://localhost:8000/api/v1/test" */
      options.url = `/${options.url}`.replace(/\/\//g, '/')

      const port = config['front-end'].port === 80 ? '' : `:${config['front-end'].port}`
      options.url = `http://${config['front-end'].host}${port}${options.url}`
    }

    $.ajax(options)
      .success((data, textStatus, jqXHR) => observer.next({data, textStatus, jqXHR}) || observer.complete())
      .fail((jqXHR, textStatus, errorThrown) => {
        errorThrown && console.error(errorThrown)
        observer.error({errorThrown, textStatus, jqXHR})
      })
  })
}

/* Short-hand AJAX GET */
function get (arg) {
  const options = {method: 'GET'}

  if (arg) {
    if (typeof arg === 'object') {
      delete arg.method
      Object.assign(options, arg)
    }
    if (typeof arg === 'string') {
      options.url = arg
    }
  }

  return ajax(options)
}

/* Short-hand AJAX POST */
function post (arg) {
  const options = {method: 'POST'}

  if (arg) {
    if (typeof arg === 'object') {
      delete arg.method
      Object.assign(options, arg)
    }
    if (typeof arg === 'string') {
      options.url = arg
    }
  }

  return ajax(options)
}

const Rest = {
  ajax,
  get,
  post
}

export default Rest
