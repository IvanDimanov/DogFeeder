/* global sessionStorage */
'use strict'

import Rest from './Rest'

function login (user) {
  return Rest.post({
    url: '/api/v1/auth/login',
    data: {user}
  })
}

function loginAsSinger (lyrics) {
  return Rest
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
