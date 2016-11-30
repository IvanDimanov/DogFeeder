'use strict'

async function up (client) {
  await client.setAsync('abc', 123)
  await client.setAsync('abcd', 1234)
  await client.setAsync('abcde', 12345)
}

async function down (client) {
  await client.delAsync('abc')
  await client.delAsync('abcd')
  await client.delAsync('abcde')
}

module.exports = {
  up,
  down
}
