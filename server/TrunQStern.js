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
    const { key } = req.body;
    console.log('1 **** incoming graphQL query: ', key);
    // await the returned result of invoking the checkRedis function
    // assign the returned result to a variable
    const redisResult = await this.checkRedis(key);
    console.log('2 **** redisResult before conditional: ', redisResult);
    // check if the redis query returned a valid response
    if (redisResult === null) {
      // await the returned result of querying the third party api
      const apiResult = await this.checkApi(key, this.apiURL);
      console.log('4 **** returned api data: ', apiResult);
      // this.data = apiResult;
      this.data = "charmander";
      return next();
    } else {
      // assign the returned query result to the obj data property
      this.data = redisResult;
      return next();
    }
  }

  checkRedis(query) {
    return new Promise(resolve => {
      this.redisClient.get(query, (err, result) => {
        if (err) {
          console.log('error within checkRedis func: ', err);
        }
        resolve(result);
      })
    })
  }

  checkApi(query, apiURL) {
    return new Promise(resolve => {
      fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: query // incoming query is already in string form
      })
        .then(res => res.json())
        .then(data => {
          // this.redisClient.set(query, JSON.stringify(data));
          this.redisClient.set(query, 'pikachu');
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