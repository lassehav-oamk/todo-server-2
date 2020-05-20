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
const jsonwebtoken = require('jsonwebtoken');

function createTestUser()
{
 return chai.request(api)
 .post('/users')
 .set('Content-Type', 'application/json')
 .send({
   username: "HTTPTester1",
   password: "HTTPTester1Password"
 });
}

describe('User HTTP Routes', function() {
  before(async function() {
    apiServer.start('test');
  });

  after(async function() {
    apiServer.close();
  });

  describe('Create new user', function() {
    it('Should create a new user successfully', async function() {
      await createTestUser()
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

  describe('Login', function() {
    it('Should login successfully', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('HTTPTester1', 'HTTPTester1Password')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('jwt');
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with incorrect username', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('ThisUserNameShouldNotExist', 'SomePassword')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with incorrect password', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('HTTPTester1', 'IncorrectPassword')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with missing username', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth(null, 'IncorrectPassword')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with missing password', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('HTTPTester1', null)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login without auth information', async function() {
      await chai.request(api)
        .get('/users/login')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('Modify user', function() {
    let userJwt = null;
    let decodedJwt = null;

    before(async function(){
      await chai.request(api)
        .get('/users/login')
        .auth('HTTPTester1', 'HTTPTester1Password')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('jwt');

          userJwt = response.body.jwt;
          decodedJwt = jsonwebtoken.decode(userJwt, { complete: true });
        });
    });

    it('Should modify username successfully', async function() {
      await chai.request(api)
        .put('/users/' + decodedJwt.payload.user.id)
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          username: "HTTPTester1Modified",
          password: "HTTPTester1Password"
        })
        .then(modifyResponse => {
          expect(modifyResponse).to.have.property('status');
          expect(modifyResponse.status).to.equal(200);
          return chai.request(api)
            .get('/users/' + decodedJwt.payload.user.id)
            .set('Authorization', 'Bearer ' + userJwt);
        })
        .then(readResponse => {
          expect(readResponse).to.have.property('status');
          expect(readResponse.status).to.equal(200);
          expect(readResponse.body).to.haveOwnProperty('id');
          expect(readResponse.body).to.haveOwnProperty('username');
          expect(readResponse.body).not.haveOwnProperty('password');
          expect(readResponse.body.id).to.equal(decodedJwt.payload.user.id);

          expect(readResponse.body.username).to.equal("HTTPTester1Modified");
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should modify password successfully', async function() {
      await chai.request(api)
        .put('/users/' + decodedJwt.payload.user.id)
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          username: "HTTPTester1Modified",
          password: "HTTPTester1PasswordModified"
        })
        .then(modifyResponse => {
          expect(modifyResponse).to.have.property('status');
          expect(modifyResponse.status).to.equal(200);

          // try to login with new password
          return chai.request(api)
            .get('/users/login')
            .auth('HTTPTester1Modified', 'HTTPTester1PasswordModified');
        })
        .then(newLoginResponse => {
          expect(newLoginResponse).to.have.property('status');
          expect(newLoginResponse.status).to.equal(200);
          expect(newLoginResponse.body).to.have.property('jwt');
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should delete a user', async function() {
      await chai.request(api)
        .delete('/users/' + decodedJwt.payload.user.id)
        .set('Authorization', 'Bearer ' + userJwt)
        .then(deleteResponse => {
          expect(deleteResponse).to.have.property('status');
          expect(deleteResponse.status).to.equal(200);

          // try to login again with the deleted user
          return chai.request(api)
            .get('/users/login')
            .auth('HTTPTester1Modified', 'HTTPTester1PasswordModified');
        })
        .then(newLoginResponse => {
          expect(newLoginResponse).to.have.property('status');
          expect(newLoginResponse.status).to.equal(401);

          // Create the test user back again
          return createTestUser();
        })
        .then(createUserResponse => {
          expect(createUserResponse).to.have.property('status');
          expect(createUserResponse.status).to.equal(201);
        })
        .catch(error => {
          throw error;
        });
    });
  });
});