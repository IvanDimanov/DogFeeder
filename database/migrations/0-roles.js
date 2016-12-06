'use strict'

async function up (redisClient) {
  await redisClient.lpushAsync('roles', '{"internalName": "admin"      , "uiName": "admin" , "permissions": ["canReadProfile", "canUpdateProfile", "canReadSystemLogs"]}')
  await redisClient.lpushAsync('roles', '{"internalName": "regularUser", "uiName": "user"  , "permissions": ["canReadProfile", "canUpdateProfile", "canReadSystemLogs"]}')
  await redisClient.lpushAsync('roles', '{"internalName": "guestSinger", "uiName": "singer", "permissions": []}')
}

async function down (redisClient) {
  const totalRoles = await redisClient.llenAsync('roles')

  await redisClient.ltrimAsync('roles', 0, totalRoles)
}

module.exports = {
  up,
  down
}
