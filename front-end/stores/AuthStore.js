/* global sessionStorage */
'use strict'

import RestStore from './RestStore'

function login (user) {
  return RestStore
    .post({
      url: '/api/v1/auth/login',
      data: {user}
    })
}

function loginAsSinger (lyrics) {
  return RestStore
    .post({
      url: 'api/v1/auth/login-as-singer',
      data: {lyrics}
    })
}

function logout () {
  sessionStorage.removeItem('AuthorizationHeader')
  window.location.pathname = '/login.html'
}

const AuthStore = {
  login,
  loginAsSinger,
  logout
}

export default AuthStore
