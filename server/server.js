const express = require('express')
const path = require('path')
const graphql = require('graphql'); 
const app = express();
const port = 3000
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

// app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.resolve(__dirname, '../src')))

app.post('/graphql', (req, res, next) => {
    console.log("/graphql req.body", req.body)
    const { query } = req.body;
    fetch('https://graphql-pokemon.now.sh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({query: query})
    }).then(res => res.json()).then(res => console.log(res));
})

app.get('/', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, '../src/index.html'))
})

app.listen(port, ()=>{
    console.log('listening on', port)
})