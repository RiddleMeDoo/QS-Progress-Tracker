import supertest from 'supertest';
import chai from 'chai';
import { getPartnerInvestment, getRelicInvestment } from '../routes/investments.controller.js';

const request = supertest('https://jsonplaceholder.typicode.com');
const assert = chai.assert;
const expect = chai.expect;

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
      it('should return 700k investment', function () {
        const partner = {speed: 10, intelligence: 5};
        expect(getPartnerInvestment(0, partner)).to.equal(700000)
      })
    })
  })

  describe('#getRelicInvestment()', function () {
    context('testing under 5000', function () {
      it('should return 550', function () {
        expect(getRelicInvestment(10)).to.equal(550)
      })
    })

    context('testing under 10k', function () {
      it('should return 460.1m', function () {
        expect(getRelicInvestment(8000)).to.equal(460100000)
      })
    })

    context('testing 10k', function () {
      it('should return 1.05b', function () {
        expect(getRelicInvestment(10000)).to.equal(1050200000)
      })
    })

    context('testing over 10k', function () {
      it('should handle funky numbers', function () {
        expect(getRelicInvestment(12121)).to.equal(2210311200)
      })
    })
  })
})