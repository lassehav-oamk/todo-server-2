const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-http'))
const expect = require('chai').expect;
const assert = require('chai').assert;
const users = require('../services/users');
const api = 'http://localhost:3000';
const dbService = require('../services/db');

describe('User HTTP Routes', function() {
  before(async function() {
    await dbService.init('test');
    server = require('../index');
  });

  after(async function() {
    await dbService.close();
  });

  describe('Create new user', function() {
    it('Should an array of users', async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "HTTPTester1",
          password: "HTTPTester1Password"
        })
        .then(response => {
          console.log(response);

        })
        .catch(error => {
          throw error;
        });

    });
  });
});