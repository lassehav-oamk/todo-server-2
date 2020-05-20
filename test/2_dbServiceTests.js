const assert = require('assert');
const expect = require('chai').expect;
const dbService = require('../services/db');


describe('Database', function() {
  describe('DB init', function() {
    it('Should open DB connection', async function() {

      expect(dbService.getDb()).to.equal(null);
      await dbService.init('db.test.sqlite').then(() => {
        expect(dbService.getDb()).not.to.equal(null);
      });

    });
  });

  describe('DB close', function() {
    it('Should close DB connection', async function() {

      expect(dbService.getDb()).not.to.equal(null);
      await dbService.close().then(() => {
        expect(dbService.getDb()).to.equal(null);
      })
    });
  });
});