module.exports = async () => {
  global.testServer = await require('./demo/server/startServer');
};