const app = require('./server');
// const port = require('./server');
let port = 3000;

app.listen(port, () => {
  console.log('listening on', port)
})