/* global $ */
'use strict'

import {Observable} from 'rxjs'

const Rest = {}

function ajax (config) {
  return Observable.create((observer) => {
    $.ajax(config)
      .success((data, textStatus, jqXHR) => observer.next({data, textStatus, jqXHR}) || observer.complete())
      .fail((jqXHR, textStatus, errorThrown) => observer.error({errorThrown, textStatus, jqXHR}))
  })
}

/* Short-hand AJAX GET */
function get (arg) {
  const config = {method: 'GET'}

  if (arg) {
    if (typeof arg === 'object') {
      delete arg.method
      Object.assign(config, arg)
    }
    if (typeof arg === 'string') {
      config.url = arg
    }
  }

  return ajax(config)
}

/* Short-hand AJAX POST */
function post (arg) {
  const config = {method: 'POST'}

  if (arg) {
    if (typeof arg === 'object') {
      delete arg.method
      Object.assign(config, arg)
    }
    if (typeof arg === 'string') {
      config.url = arg
    }
  }

  return ajax(config)
}

Rest.ajax = ajax
Rest.get = get
Rest.post = post

export default Rest