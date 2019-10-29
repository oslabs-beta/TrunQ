const express = require('express')
const path = require('path')

const app = express()
const port = 3000
const bodyParser = require('body-parser')

// app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())

app.use(express.static(path.resolve(__dirname, '../src')))


app.listen(port, ()=>{
    console.log('listening on', port)
})