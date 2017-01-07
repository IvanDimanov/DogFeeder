'use strict'

const roles = [{
  internalName: 'admin',
  uiName: 'admin',
  permissions: ['canReadProfile', 'canUpdateProfile', 'canUpdatePassword', 'canReadSystemLogs']
}, {
  internalName: 'regularUser',
  uiName: 'user',
  permissions: ['canReadProfile', 'canUpdateProfile', 'canUpdatePassword', 'canReadSystemLogs']
}, {
  internalName: 'guestSinger',
  uiName: 'singer',
  permissions: []
}]

async function up (redisClient) {
  await roles
    .map((role) => redisClient.hsetAsync('roles', role.internalName, JSON.stringify(role)))
}

async function down (redisClient) {
  await redisClient.del('roles')
}

module.exports = {
  up,
  down
}
