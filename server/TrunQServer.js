/**
* ***********************************
*
* @module trunQify
* @author Gordon Campbell, Michael Evans, Ben Ray, Brian Haller 
* @date 11/5/2019
* @params apiURL (string), port (integer), timer (integer)
*
* @description Middleware functions implemented through a class to allow for easy import 
*              functionality. Developers create an instance of TrunQServer in their project 
*              then invoke getAllData to (1) check if query results can be found in local 
*              in memory Redis database running on the server (2) send fetch request to external 
*              GraphQL API if no cached data found. Data returned from external API requests can 
*              be saved to the in memory Redis database at the discretion of the developer through
*              arguements passes into the invocation of trunQify
* ***********************************
*/

const fetch = require('node-fetch');
const redis = require('redis'); // will the npm package grab this?

class TrunQServer {
  constructor(apiURL, port, timer = 20) {
    this.apiURL = apiURL;
    this.port = port === null ? 6379 : port;
    this.data = {}; // holds data for response to client
    this.getAllData = this.getAllData.bind(this);
    this.getRedisData = this.getRedisData.bind(this);
    this.checkRedis = this.checkRedis.bind(this);
    this.checkApi = this.checkApi.bind(this);
    this.redisClient = redis.createClient(this.port); // CIRCLE BACK
    this.timer = timer;

    // for notification on a successful connection to the redis database
    this.redisClient.on('connect', (success) => {
      console.log('Redis connection success')
    })
    // for notification of a failed connection to the redis database
    this.redisClient.on('error', (err) => {
      console.log("Redis connection failure")
    });

  }

  async getAllData(req, res, next) {
    const { trunQKey } = req.body;
    const { flag } = req.body;
    const outerKey = 'trunQKey';

    let cacheKey = Object.keys(trunQKey); // unique identifier for graphQL Queries
    let graphQLQuery = Object.values(trunQKey);
    const queryResponses = {}; // keys -> cacheKey, value -> query data from cache and external data source
    const clientResObj = {}; //object to be saved in this.data for response to client

    // external database/API requests contingent on redisResult values
    // returns an array with query result from cache, not found returns null
    const redisResult = await this.checkRedis(cacheKey); 
    
    // check if the redis query returned a valid response
    let resultArray = redisResult.map((redisVal, index) => {
      
      if (redisVal === null) {
        
        // call API if data not in Redis cache
        return this.checkApi(cacheKey[index], graphQLQuery[index], this.apiURL, flag)
        
      } else {
        // parse string response from Redis
        return JSON.parse(redisVal);
      }
    });

    // resolve both Redis reponses and API reponses, resultArray -> values of strings and promise objects
    Promise.all(resultArray)
      .then((valArr) => { 
        // once all of the promises are resolved
        // iterate through the response values to match with unique cache keys for client response
        for (let i = 0; i < cacheKey.length; i++) {
          queryResponses[cacheKey[i]] = valArr[i];
        }

        // construct client response obj to match request structure
        clientResObj[outerKey] = queryResponses;
        this.data = clientResObj;
        return next(); // invoke next function to return to Node.js/Express server
      });

  }

  // helper method
  // checks Redis database for previous query results
  checkRedis(uniqueKeyQuery) {
    // instantiate promise to enable awaiting query results
    // promise value will resolve to an array
    return new Promise(resolve => {
      this.redisClient.mget(...uniqueKeyQuery, (err, result) => {
        if (err) {
          console.log('error within checkRedis func: ', err); // CIRCLE BACK FOR ERROR HANDLING
        }
        resolve(result);
      })
    })
  }

  // helper method
  // query external GraphQL API and save results in Redis
  checkApi(uniqueKey, graphQLQuery, apiURL, flag) {
    return new Promise(resolve => {
      if (typeof apiURL === 'string') {
        fetch(apiURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: graphQLQuery }) // incoming query is already in string form
        })
        .then(res => res.json())
        .then(data => {
          // if flag arguement is set to 'server' or 'both' by developer on trunQify invocation 
          // save API data to Redis as key value pair 
          // hard coded time to seconds ('EX')
          if (flag.toLowerCase() === 'server' || flag.toLowerCase() === 'both') this.redisClient.set(uniqueKey, JSON.stringify(data), 'EX', this.timer);
          resolve(data);
        })
      }
      else {
        resolve(apiURL)
      }
    })
  }

  // NOT CURRENTLY IN USE
  // Beta functionality for server side parsing and caching
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


module.exports = TrunQServer;