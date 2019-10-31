const redis = require('redis');

const redisClient = redis.createClient();

const the = {};

the.results = null;

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

the.outer = (inboundQuery) => {
  console.log('inboundQuery: ', inboundQuery.body);
  function inner(param) {
    new Promise(
      (resolve, reject) => {
        let { key } = param.body
        redisClient.get(key, (err, result) => {
          if (err) {
            console.log('error within test')
          }
          console.log('within the promise resolve')
          console.log('this is the query result: ', result)
          resolve(result)
        })
      }
    ).then(dbResult => {
      console.log('dbResult: ', dbResult);
      return dbResult;
    })
  }
  return inner(inboundQuery)
  // return queryResult;
}

const checkRedis = function (queryParam) {
  return new Promise(resolve => {
    redisClient.get(queryParam, (err, result) => {
      if (err) {
        console.log('error within checkRedis func: ', err)
      }
      resolve(result)
    })
  })
}


// ****************  NEW TEST  ***********************
the.checkApi = async (incomingRequest) => {

  console.log('STEP 2 *** made it to checkApi method');

  let { key } = incomingRequest.body;
  console.log('STEP 3 *** req.body key value: ', key)

  // const checkRedis = await redisClient.get(key, (err, result) => {
  //   if (err) console.log(err);
  //   console.log('STEP 4 *** redis query result: ', result)
  //   return result;
  // })

  const redisVal = await checkRedis(key);

  console.log('STEP 4 *** checkRedis variable: ', redisVal);
  return await redisVal;
}


module.exports = the