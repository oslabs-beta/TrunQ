const express = require('express')
const path = require('path')
const app = express();
exports.port = 3000;
const bodyParser = require('body-parser')

// EXAMPLE TRUNQ BACKEND SETUP *******************

const TrunQServer = require('./TrunQServer');

const trunQBack = new TrunQServer('https://metaphysics-production.artsy.net')

// ***********************************************

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../dist')));

// TRUNQ BACKEND EXAMPLE ROUTE *******************

app.use('/graphql', trunQBack.getAllData, (req, res, next) => {
    res.status(200).json(trunQBack.data);
})

// ***********************************************


// EXPORT APP FOR TESTING VS PRODUCTION/DEMO *****
module.exports = app;