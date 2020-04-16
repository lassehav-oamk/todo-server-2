const chai = require('chai');
chai.use(require('chai-json-schema'));
const expect = require('chai').expect;
const assert = require('chai').assert;
const users = require('../services/users');
const dbService = require('../services/db')
const userSchema = require('../schemas/userSchema.json');

describe('User Service', function() {
  before(async function() {
    await dbService.init('db.test.sqlite');
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
      }).then(user => {

        expect(user).to.be.jsonSchema(userSchema);

      }).catch((error) => {
        console.log(error);
        assert.fail();
      })
    });

    it('Should try to create a new user with missing paramters and survive', async function() {

      const date = new Date();

      await users.createNew({
        username: "tester" + date.getTime()
      }).then(user => {
        assert.fail('User succesfully created with missing password field');
      }).catch(error => {
        expect(error).to.be.instanceOf(Object);
        expect(error).to.have.property('errno', 19);
      })
    });

    it('Should create a second user and verifiy getting all', async function() {
      const date = new Date();
      await users.createNew({
        username: "tester2" + date.getTime(),
        password: "tester2Password"
      }).then((user) => {
        return users.getAll();
      })
      .then(allUsers => {
        expect(allUsers).to.be.an('array').and.to.have.lengthOf(2);
      })
      .catch(error => {
        assert.fail('User create or getAll failed');
      })
    });
  });

  describe('Delete a user', function() {
    it('Should delete a user successfully', async function() {
      let startingUserCount = null;
      let deletedUserId = null;
      await users.getAll().then(results => {
        // Save current user count
        expect(results).to.be.instanceOf(Array);
        startingUserCount = results.length;
        deletedUserId = results[results.length-1].id;

        // Delete a user
        return users.deleteById(deletedUserId)
      })
      .then(deleteRespose => {
        expect(deleteRespose).to.be.true;
        return users.getAll();
      })
      .then(users => {
        // Verify that user count has reduced by one
        expect(users).to.be.instanceOf(Array);
        expect(users).to.have.lengthOf(startingUserCount-1);
      })
      .catch(error => {
        assert.fail(error);
      });
    });
    it('Should not delete user with non-existing ID', async function() {
      let startingUserCount = null;
      await users.getAll().then(async results => {
        // Save current user count
        expect(results).to.be.instanceOf(Array);
        startingUserCount = results.length;

        const date = new Date();
        const deletedUserId = date.getTime(); // time in milliseconds for a 'random' int value
        // Try to delete a user
        const deleteResult = await users.deleteById(deletedUserId);
        assert.fail("User delete promise should not resolve");
      })
      .catch(error => {
        expect(error).to.be.false;
      });
    });
  });

  describe('Modify a user', function() {
    it('Should modify username successfully', async function() {
      let modifyUserId = null;
      let existingUsername = null;
      let newUsername = null;

      await users.getAll().then(results => {

        expect(results).to.be.instanceOf(Array);

        // Save current user info
        const user = results[results.length-1];
        modifyUserId = user.id;
        existingUsername = user.username.slice(0); // Make a copy of the existing name string

        const modifiedUser = {
          id: user.id,
          username: 'modifiedUsername',
          password: user.password
        }
        // Modify user
        return users.modify(modifiedUser)
      })
      .then(modifyResponse => {
        expect(modifyResponse).to.have.property('changes', 1);
        return users.getUserById(modifyUserId);
      })
      .then(user => {
        // Verify that username has been modified
        expect(user).to.have.property('username', 'modifiedUsername');
      })
      .catch(error => {
        assert.fail(error);
      });
    });

  });

});