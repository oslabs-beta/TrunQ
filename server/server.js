const express = require('express')
const path = require('path')
const app = express();
exports.port = 3000;
const bodyParser = require('body-parser')
const TrunQServer = require('./TrunQServer');
const trunQBack = new TrunQServer('https://graphql-pokemon.now.sh/')
// const trunQBack2 = new TrunQStern('https://metaphysics-production.artsy.net')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../dist')));

app.use('/graphql', trunQBack.getAllData, (req, res, next) => {
    res.status(200).json(trunQBack.data);
})

// ******** uncomment to test with metaphysics API *******
// app.use('/artGraphQL', trunQBack2.getAllData, (req, res, next) => {
//     res.status(200).json(trunQBack.data);
// })

module.exports = app;
