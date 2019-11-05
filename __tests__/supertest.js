const request = require('supertest');

const server = 'http://localhost:3000';

describe('/graphl', function () {
  it('end point responds with json', function (done) {
    request(server)
      .get('/graphql')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        console.log('supertest');
        if (err) throw err;
      });
  });
});