const uuidv4 = require('uuid/v4');
const sqlite3 = require('sqlite3').verbose();
const dbService = require('./db');

async function getUserById(userId) {
  return new Promise((resolve, reject) => {
    dbService.getDb().get(
      `SELECT * FROM users WHERE id = ?`,
      [userId],
      function(error, row){
        if(error !== null) {
          reject(error);
        }
        else {
          resolve(row);
        }
      }
    )
  })
}

module.exports = {
  getAll: async () => {
    return new Promise((resolve, reject) => {
      dbService.getDb().all('SELECT * FROM users', function(error, rows) {
        error !== null ? reject(error) : null;

        resolve(rows);
      })
    });
  },
  createNew: async (user) => {
    return new Promise((resolve, reject) => {

      // Check if username is in use
      dbService.getDb().all('SELECT * FROM users WHERE username = ?', [user.username], function(error, rows) {
        if(error != null) {
          reject(error);
        }
        if(rows.length > 0) {
          reject('User exists');
        }
        else {
          // Create new user
          dbService.run('INSERT INTO users (username, password) VALUES(?, ?)', [user.username, user.password])
          .then(result => {
            return getUserById(result.lastID);
          })
          .then(user => resolve(user))
          .catch(error => reject(error));
        }
      });
    });
  },
  getUserById: getUserById,
  deleteById: async (userId) => {
    return new Promise(async (resolve, reject) => {
      try{
        const result = await dbService.run('DELETE FROM users WHERE id = ?', [userId]);
        if(result.changes == 1) {
          resolve(true);
        }
        else {
          reject(false);
        }
      }
      catch {
        reject(false)
      }
    });
  },
  modify: async (user) => {
    return dbService.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [user.username, user.password, user.id]);
  },
  getUserByName: async (username) => {
    return new Promise((resolve, reject) => {
      dbService.getDb().get('SELECT * FROM users WHERE username = ?', [username], function(error, row) {
        if(row === undefined || error != null) {
          reject(undefined);
        }
        else {
          resolve(row);
        }
      });
    });
  }
}