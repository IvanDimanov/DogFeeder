'use strict'

async function up (redisClient) {
  await redisClient.zaddAsync('greatSingers', 120, '{"name": "ТОНИ СТОРАРО", "sex": "male", "title": "PRESIDENT"}')
  await redisClient.zaddAsync('greatSingers', 120, '{"name": "TONI STORARO", "sex": "male", "title": "PRESIDENT"}')

  await redisClient.zaddAsync('greatSingers', 120, '{"name": "CECA", "sex": "female", "title": "1st LADY"}')

  await redisClient.zaddAsync('greatSingers', 110, '{"name": "ДЕСИСЛАВА", "sex": "female", "title": "Her Majesty"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "DESISLAVA", "sex": "female", "title": "Her Majesty"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "ДЕСИ СЛАВА", "sex": "female", "title": "Her Majesty"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "DESI SLAVA", "sex": "female", "title": "Her Majesty"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "ДЕСИ-СЛАВА", "sex": "female", "title": "Her Majesty"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "DESI-SLAVA", "sex": "female", "title": "Her Majesty"}')

  await redisClient.zaddAsync('greatSingers', 110, '{"name": "MILE KITIC", "sex": "male", "title": "BACE"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "MILE KITICH", "sex": "male", "title": "BACE"}')

  await redisClient.zaddAsync('greatSingers', 110, '{"name": "LEPA BRENA", "sex": "female", "title": "CARICA"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "LEPA", "sex": "female", "title": "CARICA"}')
  await redisClient.zaddAsync('greatSingers', 110, '{"name": "BRENA", "sex": "female", "title": "CARICA"}')

  await redisClient.zaddAsync('greatSingers', 105, '{"name": "ПРЕСЛАВА", "sex": "female", "title": "princesa"}')
  await redisClient.zaddAsync('greatSingers', 105, '{"name": "PRESLAVA", "sex": "female", "title": "princesa"}')

  await redisClient.zaddAsync('greatSingers', 100, '{"name": "ГЕРГАНА", "sex": "female", "title": "kaka"}')
  await redisClient.zaddAsync('greatSingers', 100, '{"name": "GERGANA", "sex": "female", "title": "kaka"}')

  await redisClient.zaddAsync('greatSingers', 95, '{"name": "ГЛОРИЯ", "sex": "female", "title": "lelka"}')
  await redisClient.zaddAsync('greatSingers', 95, '{"name": "GLORIA", "sex": "female", "title": "lelka"}')
  await redisClient.zaddAsync('greatSingers', 95, '{"name": "GLORIQ", "sex": "female", "title": "lelka"}')
  await redisClient.zaddAsync('greatSingers', 95, '{"name": "GLORIYA", "sex": "female", "title": "lelka"}')
  await redisClient.zaddAsync('greatSingers', 95, '{"name": "GLORYA", "sex": "female", "title": "lelka"}')

  await redisClient.zaddAsync('greatSingers', 93, '{"name": "АНЕЛИЯ", "sex": "female", "title": "o4en doktor"}')
  await redisClient.zaddAsync('greatSingers', 93, '{"name": "ANELIA", "sex": "female", "title": "o4en doktor"}')
  await redisClient.zaddAsync('greatSingers', 93, '{"name": "ANELIQ", "sex": "female", "title": "o4en doktor"}')
  await redisClient.zaddAsync('greatSingers', 93, '{"name": "ANELIYA", "sex": "female", "title": "o4en doktor"}')
  await redisClient.zaddAsync('greatSingers', 93, '{"name": "ANELYA", "sex": "female", "title": "o4en doktor"}')

  await redisClient.zaddAsync('greatSingers', 90, '{"name": "КАМЕЛИЯ", "sex": "female", "title": "mutresa"}')
  await redisClient.zaddAsync('greatSingers', 90, '{"name": "KAMELIA", "sex": "female", "title": "mutresa"}')
  await redisClient.zaddAsync('greatSingers', 90, '{"name": "KAMELIQ", "sex": "female", "title": "mutresa"}')
  await redisClient.zaddAsync('greatSingers', 90, '{"name": "KAMELIYA", "sex": "female", "title": "mutresa"}')
  await redisClient.zaddAsync('greatSingers', 90, '{"name": "KAMELYA", "sex": "female", "title": "mutresa"}')

  await redisClient.zaddAsync('greatSingers', 80, '{"name": "VESNA ZNIJANAC", "sex": "female", "title": "lady"}')
  await redisClient.zaddAsync('greatSingers', 80, '{"name": "VESNA", "sex": "female", "title": "lady"}')
  await redisClient.zaddAsync('greatSingers', 80, '{"name": "ZNIJANAC", "sex": "female", "title": "lady"}')

  await redisClient.zaddAsync('greatSingers', 50, '{"name": "КАТИ", "sex": "female", "title": "mokro kote"}')
  await redisClient.zaddAsync('greatSingers', 50, '{"name": "KATI", "sex": "female", "title": "mokro kote"}')
}

async function down (redisClient) {
  await redisClient
    .zrangeAsync('greatSingers', 0, -1)
    .map((greatSinger) => redisClient.zremAsync('greatSingers', greatSinger))
}

module.exports = {
  up,
  down
}
