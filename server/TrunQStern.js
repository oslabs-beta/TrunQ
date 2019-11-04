const fetch = require('node-fetch');

class TrunQStern {
  constructor(apiURL, redisClient, port = 6379) {
    this.apiURL = apiURL;
    this.port = port;
    this.redisClient = redisClient;
    this.data = "check if this is correct";
    this.getAllData = this.getAllData.bind(this);
    this.getRedisData = this.getRedisData.bind(this);
    this.checkRedis = this.checkRedis.bind(this);
    this.checkApi = this.checkApi.bind(this);
  }

  async getAllData(req, res, next) {
    // deconstruct the req obj
    const { trunQKey } = req.body;
    console.log('1 **** incoming graphQL query: ', trunQKey);
    const outerKey = 'trunQKey';

    // let cacheKey = Object.keys(trunQKey)[0];
    // let graphQLQuery = Object.values(trunQKey)[0];
    // console.log('1-a **** parsed unique redis query key: ', cacheKey);
    // console.log('1-b **** parsed front-end graphQL query: ', graphQLQuery);

    // ********* VERSION 2 ***********
    // pull out the incoming requet into 2D array of [ [cacheKey, graphQLQuery], ... ]
    const batchedReqArr = Object.entries(trunQKey);
    console.log('1a **** array of tuples: ', batchedReqArr);

    // ************* VERSION 1 *************
    // await the returned result of invoking the checkRedis function
    // assign the returned result to a variable
    const redisResult = await this.checkRedis(cacheKey);

    console.log('2 **** redisResult before conditional: ', redisResult);
    // save 
    const queryResponses = {};
    const clientResObj = {};

    // check if the redis query returned a valid response
    if (redisResult === null) {
      console.log('2a **** confirm if logic before api request');
      // await the returned result of querying the third party api
      const apiResult = await this.checkApi(graphQLQuery, this.apiURL);
      console.log('4 **** returned api data: ', apiResult);

      //add data to applicable objects
      queryResponses[cacheKey] = apiResult;
      clientResObj[outerKey] = queryResponses;

      // assign the returned query result to the obj data property
      this.data = clientResObj;
      return next();
    } else {

      //add data to applicable objects
      queryResponses[cacheKey] = redisResult;
      clientResObj[outerKey] = queryResponses;

      // assign the returned query result to the obj data property
      this.data = clientResObj;
      return next();
    }
  }

  checkRedis(uniqueKeyQuery) {
    return new Promise(resolve => {
      this.redisClient.get(uniqueKeyQuery, (err, result) => {
        if (err) {
          console.log('error within checkRedis func: ', err);
        }
        resolve(result);
      })
    })
  }

  checkApi(graphQLQuery, apiURL) {
    return new Promise(resolve => {
      fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: graphQLQuery }) // incoming query is already in string form
      })
        .then(res => res.json())
        .then(data => {
          // this.redisClient.set(query, JSON.stringify(data));
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