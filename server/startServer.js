const app = require('./server');
const { port } = require('./server');

app.listen(port, () => {
  console.log('listening on', port)
})