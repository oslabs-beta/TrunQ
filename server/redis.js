const redis = require('redis');

const redisClient = redis.createClient();

const the = {};

redisClient.on('connect', (success) => {
  console.log('Redis connection success: ', success)
})

redisClient.on('error', (err) => {
  console.log("Redis connection failure: " + err)
});

the.checkCache = (reqBody, url, storageTimer) => {
  // key = incoming request query
  const { key } = reqBody;
  const response = {};
  console.log('redis.js file key value: ', key);
  redisClient.get(key, function (err, result) {
    if (err) {
      console.log('error within get request: ', err)
      res.send(err);
    }
    console.log('redis.js file result from get request: ', result);
    if (result === 'nil') {
      // invoke a fetch request to api
      // fetch(url, )
      res.send('couldn\'t find query match');
    } else {
      // response.key = key;
      // response.value = result;
      // return response;
      result
    }
    // res.send(result);
  });
}

the.testAsync = (query) => new Promise(
  (resolve, reject) => {
    let { key } = query.body
    redisClient.get(key, (err, result) => {
      if (err) {
        console.log('error within test')
      }
      console.log('within the promise resolve')
      console.log('this is the query result: ', result)
      resolve(result)
    })
  }
)

module.exports = the