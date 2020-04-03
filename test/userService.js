const chai = require('chai');
chai.use(require('chai-json-schema'));
const expect = require('chai').expect;
const assert = require('chai').assert;
const users = require('../services/users');
const dbService = require('../services/db')


describe('User Service', function() {
  before(async function() {
    await dbService.init();
  });

  after(async function() {
    await dbService.close();
  });

  describe('Get all users', function() {
    it('Should get an empty array', async function() {
      await users.getAll().then((results) => {
        expect(results).to.be.an('array').that.is.empty;
      });

    });
  });
  describe('Create new user', function() {
    it('Should create a new user', async function() {

      const date = new Date();

      await users.createNew({
        username: "tester" + date.getTime(),
        password: "testerPassword"
      }).then((user) => {
        console.log(user);
        expect(user).to.be.jsonSchema(users.getSchema());

      }).catch((error) => {
        console.log(error);
        assert.fail();
      })


    });
  });
});