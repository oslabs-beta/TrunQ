const redis = require('redis');

const redisClient = redis.createClient();

const the = {};

the.checkCache = async (reqBody, url, storageTimer) => {
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
      return result
    }
    // res.send(result);
  });

}

the.getWithoutFrontEnd = (req, res, next) => {
  //parsing logic

  // query
  // fetch
  // res
}

module.exports = the