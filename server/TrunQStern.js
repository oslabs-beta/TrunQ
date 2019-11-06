const redis = require('redis');
const fetch = require('node-fetch');

class TrunQStern {
  constructor(apiURL, port, timer = 20) {
    this.apiURL = apiURL;
    this.port = port === null ? 6379 : port;
    this.data = "check if this is correct";
    this.getAllData = this.getAllData.bind(this);
    this.getRedisData = this.getRedisData.bind(this);
    this.checkRedis = this.checkRedis.bind(this);
    this.checkApi = this.checkApi.bind(this);
    this.redisClient = redis.createClient();
    this.timer = timer;

    this.redisClient.on('connect', (success) => {
      console.log('Redis connection success')
    })

    this.redisClient.on('error', (err) => {
      console.log("Redis connection failure")
    });

  }

  async getAllData(req, res, next) {
    // deconstruct the req obj
    console.log('PRE **** incoming req.body: ', req.body);
    const { trunQKey } = req.body;
    const { flag } = req.body;
    console.log('1 **** incoming graphQL query: ', trunQKey);
    const outerKey = 'trunQKey';

    let cacheKey = Object.keys(trunQKey);
    let graphQLQuery = Object.values(trunQKey);
    console.log('1-a **** parsed unique redis query key: ', cacheKey);
    console.log('1-b **** parsed front-end graphQL query: ', graphQLQuery);

    // ************* VERSION 1 *************
    // await the returned result of invoking the checkRedis function
    // assign the returned result to a variable
    const redisResult = await this.checkRedis(cacheKey);

    let temp;
    if (redisResult) temp = JSON.parse(redisResult[0]);
    console.log('2 **** redisResult before conditional: ', temp);
    // save 
    const queryResponses = {};
    const clientResObj = {};

    // check if the redis query returned a valid response
    let resultArray = redisResult.map((redisVal, index) => {
      console.log('2z **** redisVal within map function: ', redisVal)
      if (redisVal === null) {
        console.log('2a **** confirm if logic before api request');
        // await the returned result of querying the third party api
        // const apiResult = await this.checkApi(cacheKey[index], graphQLQuery[index], this.apiURL); // the position of redisResult => graphQLQuery position
        // console.log('4 **** returned api data: ', apiResult);
        return this.checkApi(cacheKey[index], graphQLQuery[index], this.apiURL, flag)
        //add data to applicable objects
        // queryResponses[cacheKey] = apiResult;
      } else {
        return JSON.parse(redisVal);
      }
    });

    Promise.all(resultArray)
      .then((valArr) => {
        console.log('4 **** valArr within Promise.all before for loop: ', valArr);
        for (let i = 0; i < cacheKey.length; i++) {
          console.log(`4a **** valArr[${i}]: `, valArr[i]);
          queryResponses[cacheKey[i]] = valArr[i];
        }
        clientResObj[outerKey] = queryResponses;

        this.data = clientResObj;
        return next();
      });

  }

  checkRedis(uniqueKeyQuery) {
    return new Promise(resolve => {
      this.redisClient.mget(...uniqueKeyQuery, (err, result) => {
        if (err) {
          console.log('error within checkRedis func: ', err);
        }
        console.log('result inside the checkRedis helper func: ', result);
        resolve(result);
      })
    })
  }

  checkApi(uniqueKey, graphQLQuery, apiURL, flag) {
    return new Promise(resolve => {
      fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: graphQLQuery }) // incoming query is already in string form
      })
        .then(res => res.json())
        .then(data => {
          // data = JSON.stringify(data);
          if (flag.toLowerCase() === 'stern' || flag.toLowerCase() === 'ship') this.redisClient.set(uniqueKey, JSON.stringify(data), 'EX', this.timer);
          // this.redisClient.set(query, 'pikachu');
          // send set request to redis database
          console.log('3 **** api response data: ', data)
          resolve(data);
        })
    })
  }

  getRedisData(req, res, next) {

    const { key } = req.body; // get value on "key" property of request body

    this.redisClient.get(key, (err, result) => {

      if (err) { console.log('something went wrong') };
      if (result === 'nil') {
        return next(); //will be in api call function
      } else {
        this.data = result; //results is stringified query results
        return next();
      };
    });
  };
};


// graphQL query 	"key": "query { pokemon(name: Dragonite) { name image attacks { special { name } }"

module.exports = TrunQStern;