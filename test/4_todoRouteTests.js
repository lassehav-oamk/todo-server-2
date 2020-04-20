const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-http'))
const expect = require('chai').expect;
const assert = require('chai').assert;
const users = require('../services/users');
const todos = require('../services/todos');
const api = 'http://localhost:3000';
const dbService = require('../services/db');
const errorResponseSchema = require('../schemas/errorResponseSchema.json');
const allTodosSchema = require('../schemas/allTodosSchema.json');
const apiServer = require('../server');
const jsonwebtoken = require('jsonwebtoken');

describe('Todo HTTP Routes', function() {
  let userJwt = null;
  let decodedJwt = null;

  before(async function() {
    apiServer.start('test');

    await chai.request(api)
      .get('/users/login')
      .auth('HTTPTester1', 'HTTPTester1Password')
      .then(response => {
        userJwt = response.body.jwt;
        decodedJwt = jsonwebtoken.decode(userJwt, { complete: true });
      });
  });

  after(async function() {
    apiServer.close();
  });

  describe('Create new Todo', function() {
    it('Should create a new todo', async function() {
      await chai.request(api)
        .post('/todos')
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          "description": "Buy milk",
          "dueDateTime": "2020-06-10T10:00:00Z",
          "status": "open"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(201);
        })
        .catch(error => {
          assert.fail(error);
        });
    });
  })

  describe('Get Todos', function() {
    it('Should get this user todos', async function() {
      await chai.request(api)
        .get('/todos')
        .set('Authorization', 'Bearer ' + userJwt)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          expect(response.body).to.be.jsonSchema(allTodosSchema);
          expect(response.body.todos).to.have.lengthOf(1);
          expect(response.body.todos[0].description).to.equal("Buy milk");
          expect(response.body.todos[0].status).to.equal("open");
          expect(response.body.todos[0].dueDateTime).to.equal("2020-06-10T10:00:00Z");
        })
        .catch(error => {
          assert.fail(error);
        });
    });

  });
});