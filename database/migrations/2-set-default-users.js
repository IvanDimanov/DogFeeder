'use strict'

const uuid = require('uuid/v4')

const defaultUsers = [{
  id: uuid(),
  name: 'Ivan',
  encryptedPassword: '9294f120c0f7e9b38898cb3d572d50fb9ff68858d94943032920d89432c6e85a',
  sex: 'male',
  title: 'Mr.',
  role: {
    internalName: 'admin'
  }
}, {
  id: uuid(),
  name: 'Marto',
  encryptedPassword: 'ed923ae0afd97a7b7415db4220bf7a1419984c68f3f09fd1c00e5b3e989187c7',
  sex: 'male',
  title: 'Sir',
  role: {
    internalName: 'regularUser'
  }
}, {
  id: uuid(),
  name: 'Neli',
  encryptedPassword: 'd331d86de95d41092463f42e3838970e87c3d4982460249f504b9fd27abc1271',
  sex: 'female',
  title: 'Madam',
  role: {
    internalName: 'regularUser'
  }
}, {
  id: uuid(),
  name: 'Kiro',
  encryptedPassword: 'a889935959edf8ca43da85c26ab37a64707e695569a279712a30070d669fe10f',
  sex: 'male',
  title: 'Ing.',
  role: {
    internalName: 'regularUser'
  }
}]

async function up (redisClient) {
  await defaultUsers.map((user) => redisClient.hsetAsync('users', user.id, JSON.stringify(user)))

  /* Help quickly find existing user Authentication (name/password) */
  await defaultUsers.map((user) => redisClient.hsetAsync('userAuthToId', `${user.name}/${user.encryptedPassword}`, user.id))
}

async function down (redisClient) {
  await defaultUsers.map((user) => redisClient.hdelAsync('users', user.id))
  await defaultUsers.map((user) => redisClient.hdelAsync('userAuthToId', `${user.name}/${user.encryptedPassword}`))
}

module.exports = {
  up,
  down
}
