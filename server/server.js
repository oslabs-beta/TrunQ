const express = require('express')
const path = require('path')
const graphql = require('graphql');
const app = express();
const port = 3000
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

const the = require('./redis');
// const redisClient = require('./redis');

// console.log('**************** REDIS CLIENT *******************\n', redisClient);

// ************************************************************

// const redis = require('redis');

// const redisClient = redis.createClient();

// redisClient.addOne = function (val) {
//     return 1 + val
// }

// redisClient.on('connect', (success) => {
//     console.log('Redis connection success: ', success)
// })

// redisClient.on('error', (err) => {
//     console.log("Redis connection failure: " + err)
// });

// ************************************************************

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.resolve(__dirname, '../dist')))

// developer deconstructs backend function
// and places function within graphql endpoint
app.post('/graphql', (req, res, next) => {
    const { query } = req.body;
    console.log(req.body.query)
    let varRegex = /\(([^()]+)\)/
    let variables = (req.body.query.match(varRegex)[0])


    // developer executes backend function with incoming request
    // either function executes response OR
    // backendFunc(req) => 
    // function returns value that can be attached to response obj
    // res.body.trunq = backendFunc.get(req.body, apiUrl)

    fetch('https://graphql-pokemon.now.sh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    }).then(res => res.json())
})

app.post('/redis', (req, res, next) => {
    const { key, value } = req.body;
    // const keys = Object.keys(req.body)
    console.log('redis req.body: ', req.body);
    console.log('req key: ', key);
    console.log('req key: ', value);
    redisClient.set(key, value);
    res.send('thanks');
})

app.get('/redis', (req, res, next) => {
    // res.locals.response = the.checkCache(req.body, 'test', 12000);
    let resPromise = new Promise((resolve, reject) => {
        resolve(the.checkCache(req.body, 'test', 1000))
        reject('query did not work!');
    });

    // let resPromise = new Promise((the.checkCache, reject) => the.checkCache(req.body, 'test', 1000))

    // console.log('res.locals obj: ', res.locals);

    // res.send(res.locals.response);
    resPromise.then((queryResponse) => {
        console.log('server.js file query response in .then: ', queryResponse);
        res.send(queryResponse);
    });
    // console.log('the redis returned value: ', value);
})

app.listen(port, () => {
    console.log('listening on', port)
})