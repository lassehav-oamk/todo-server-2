const uuidv4 = require('uuid/v4');
const sqlite3 = require('sqlite3').verbose();
var Validator = require('jsonschema').Validator;
const dbService = require('./db');

const userSchema = {
  title: 'User schema',
  type: 'object',
  required: ['username', 'password'],
  optional: ['id'],
  properties: {
    id: {
      type: 'number'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  }
};

async function getUserById(userId) {
  return new Promise((resolve, reject) => {
    dbService.getDb().get(
      `SELECT * FROM users WHERE id = ?`,
      [userId],
      function(error, row){
        if(error !== null)
        {
          reject(error);
        }

        resolve(row);
      }
    )
  })
}


module.exports = {
  getSchema: () => userSchema,
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

      dbService.run('INSERT INTO users (username, password) VALUES(?, ?)', [user.username, user.password])
      .then(result => {
        return getUserById(result.lastID);
      })
      .then(user => resolve(user))
      .catch(error => reject(error));
    });
  },
  getUserById: getUserById,
  deleteById: async (userId) => {
    return dbService.run('DELETE FROM users WHERE id = ?', [userId]);
  },
  modify: async (user) => {
      return dbService.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [user.username, user.password, user.id]);
  },
  validateAgainstSchema: (source) => {
    const v = new Validator();
    return v.validate(source, userSchema);
  }



}