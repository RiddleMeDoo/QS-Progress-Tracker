import supertest from 'supertest';
import chai from 'chai';

const request = supertest('https://jsonplaceholder.typicode.com');
const assert = chai.assert;

describe('Users API', () => {
  it('GET /users', () => {
    //Make a GET request to the users route
    return request
    .get('/users')
    .expect(200)
    .then(res => assert.isNotEmpty(res.body));
  });

  it('POST /users', () => {
    const testData = {
      name: 'Test username',
      email: 'test@test.com',
    };
    return request
    .post('/users')
    .send(testData)
    .then(res => {
      assert.hasAnyKeys(res.body, 'id');
      assert.equal(res.body.name, testData.name);
      assert.equal(res.body.email, testData.email);
    });
  })
});