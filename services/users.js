const uuidv4 = require('uuid/v4');
const sqlite3 = require('sqlite3').verbose();

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

async function getUserById(usernameToGet) {
  return new Promise((resolve, reject) => {
    dbService.getDb().get(
      `SELECT * FROM users WHERE username = ?`,
      [usernameToGet],
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
      .then(insertID => {
        return getUserById(insertID);
      })
      .then(user => resolve(user))
      .catch(error => reject(error));
    });
  },
  getUserById: getUserById

  /*resetApiKey: (userId) => {
    const user = users.find(u => u.id == userId);
    if(user === undefined)
    {
      return false
    }

    user.validApiKey = uuidv4();
    return user.validApiKey;
  },
  getApiKey: (userId) => {
    const user = users.find(u => u.id == userId);
    if(user === undefined)
    {
      return false
    }

    return user.validApiKey;
  },
  getUserWithApiKey: (apiKey) => users.find(u => u.validApiKey == apiKey),
  addUser: (username, email, password) => {
    users.push({
      id: uuidv4(),
      username,
      email,
      password
    });
  }*/

}