const express = require('express')
const path = require('path')
const app = express();
exports.port = 3000;
const bodyParser = require('body-parser')
const TrunQServer = require('./TrunQServer');
const trunQBack = new TrunQServer('https://graphql-pokemon.now.sh/')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../dist')));

app.use('/graphql', trunQBack.getAllData, (req, res, next) => {
  res.status(200).json(trunQBack.data);
})

module.exports = app;
