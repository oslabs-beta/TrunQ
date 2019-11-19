const app = require('./server');
// const { port } = require('./server');
const port = 3000;

app.listen(port, () => {
  console.log('listening on', port)
})