const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-http'))
const expect = require('chai').expect;
const assert = require('chai').assert;
const users = require('../services/users');
const api = 'http://localhost:3000';
const dbService = require('../services/db');
const createUserSuccessfullySchema = require('../schemas/createUserSuccessfullySchema.json');
const errorResponseSchema = require('../schemas/errorResponseSchema.json');
const apiServer = require('../server');

describe('User HTTP Routes', function() {
  before(async function() {
    apiServer.start('test');
  });

  after(async function() {
    apiServer.close();
  });

  describe('Create new user', function() {
    it('Should create a new user successfully', async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "HTTPTester1",
          password: "HTTPTester1Password"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(201);
          expect(response.body).to.be.jsonSchema(createUserSuccessfullySchema);
        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('Should fail if usename exists', async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "HTTPTester1",
          password: "SomePassword"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
          expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should fail with missing username', async function() {

      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          password: "HTTPTesterPassword"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
          expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should fail with missing password', async function() {
      const date = new Date();
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "HTTPTester" + date.getTime()
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
          expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should fail with numeric username', async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: 23466567,
          password: "HTTPTesterPassword"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
          expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

  });
});