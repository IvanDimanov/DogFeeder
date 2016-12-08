'use strict'

import Rest from './Rest'

function login (user) {
  return Rest.post({
    url: '/api/v1/auth/login',
    data: {user}
  })
}

const AuthStore = {
  login
}

export default AuthStore
