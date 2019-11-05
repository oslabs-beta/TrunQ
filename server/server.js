const express = require('express')
const path = require('path')
const app = express();
const port = 3000
const bodyParser = require('body-parser')

// EXAMPLE TRUNQ BACKEND SETUP *******************

const TrunQStern = require('./TrunQStern');

// create instance of TrunQStern
// args: graphQl endpoint, redis client
const trunQBack = new TrunQStern('https://graphql-pokemon.now.sh/', null, 20); // currently hardcoded to be seconds

// ***********************************************

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../dist')));

// TRUNQ BACKEND EXAMPLE ROUTE *******************

app.use('/graphql', trunQBack.getAllData, (req, res, next) => {
    console.log('5 **** that.data before response to client: ', trunQBack.data);
    res.json(trunQBack.data);
    // res.send(res.locals.message);
})

// ***********************************************

app.listen(port, () => {
    console.log('listening on', port)
})