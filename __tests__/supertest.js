const supertest = require('supertest');
const app = require('../server/server');

const goodData = { "trunQKey": { "pokemon-pikachu": "jest" } };
const badData = { "wrongKey": { "pokemon-pikachu": "jest" } };

describe('/graphl', function () {
  it('API responds with status 200 on valid request', () => {
    return supertest(app)
      .post('/graphql')
      .send(goodData)
      .expect(200)
  });
  it('API responds with status 400 on invalid request object', () => {
    return supertest(app)
      .post('/graphql')
      .send(badData)
      .expect(400)
  })
});