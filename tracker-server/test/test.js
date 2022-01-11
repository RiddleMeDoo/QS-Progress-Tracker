import supertest from 'supertest';
import chai from 'chai';
import { getCaveInvestment, getEquipmentSlotInvestment, getFighterInvestment, getPartnerInvestment, getRelicInvestment } from '../routes/investments.controller.js';

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

  describe('#getFighterInvestment()', function () {
    let fighter = {
      health:0, damage:0, hit:0, dodge:0, defense:0, crit_damage:0
    }

    context('Basic passing tests', function () {
      it('should return 0', function () {
        expect(getFighterInvestment(0, fighter)).to.equal(0)
      })
      
      it('should return 60k', function () {
        fighter = {
          health:1, damage:1, hit:1, dodge:1, defense:1, crit_damage:1
        }
        expect(getFighterInvestment(0, fighter)).to.equal(60000)
      })
    })

  })

  describe('#getCaveInvestment', function () {
    let cave = {'archeology':0, 'brush':0, 'trowel':0, 'map':0, 'backpack':0, 'torch':0, 'scouting':0, 'spade':0, 'knife':0} 
    it('should pass the 0 test', function () {
      expect(getCaveInvestment(cave)).to.equal(0)
    })
    it('should pass a basic test', function () {
      cave = {'archeology':1, 'brush':1, 'trowel':1, 'map':1, 'backpack':1, 'torch':1, 'scouting':1, 'spade':1, 'knife':1}
      expect(getCaveInvestment(cave)).to.equal(9)
    })
  })

  describe('#getEquipmentSlotInvestment', function () {
    let eqSlots = {left_hand_level:0, right_hand_level:0, head_level:0, body_level:0, hands_level:0, legs_level:0, feet_level:0}
    it('should pass the 0 test', function () {
      expect(getEquipmentSlotInvestment(eqSlots)).to.equal(0)
    })
  })
})