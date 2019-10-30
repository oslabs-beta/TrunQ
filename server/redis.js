// require and create instance of redis database
const redis = require('redis');

const redisClient = redis.createClient();


module.exports = redisClient;