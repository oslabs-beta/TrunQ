const express = require('express')
const path = require('path')
const graphql = require('graphql');
const app = express();
const port = 3000
const bodyParser = require('body-parser')
const fetch = require('node-fetch');
const redisClient = require('./redis');

console.log(redisClient);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.resolve(__dirname, '../dist')))

app.post('/graphql', (req, res, next) => {
    const { query } = req.body;
    console.log(req.body.query)
    let varRegex = /\(([^()]+)\)/
    let variables = (req.body.query.match(varRegex)[0])

    fetch('https://graphql-pokemon.now.sh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    }).then(res => res.json())
})

app.listen(port, () => {
    console.log('listening on', port)
})