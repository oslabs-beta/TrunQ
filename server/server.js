const express = require('express')
const path = require('path')
const app = express();
exports.port = 3000;
const bodyParser = require('body-parser')

// EXAMPLE TRUNQ BACKEND SETUP *******************

const TrunQStern = require('./TrunQStern');

// create instance of TrunQStern
// args: graphQl endpoint, redis client
const trunQBack = new TrunQStern('https://graphql-pokemon.now.sh/')
// const trunQBack2 = new TrunQStern('https://metaphysics-production.artsy.net')

// ***********************************************

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../dist')));

// TRUNQ BACKEND EXAMPLE ROUTE *******************

app.use('/graphql', trunQBack.getAllData, (req, res, next) => {
    console.log('5 **** that.data before response to client: ', trunQBack.data);
    res.status(200).json(trunQBack.data);
    // res.send(res.locals.message);
})

// app.use('/artGraphQL', trunQBack2.getAllData, (req, res, next) => {
//     console.log('5 **** that.data before response to client: ', trunQBack.data);
//     res.status(200).json(trunQBack.data);
//     // res.send(res.locals.message);
// })

// ***********************************************


// EXPORT APP FOR TESTING VS PRODUCTION/DEMO *****

module.exports = app;
