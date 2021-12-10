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

describe('Calculate Investments', function () {

  describe('#getPartnerInvestment()', function () {
    context('using a preset partner', function() {
      it('should return _ investment', function() {
        const partner = {speed: 10, intelligence: 5};
        expect(getParterInvestment(0, partner)).to.equal(700000)
      })
    })
  })
})