const uuidv4 = require('uuid/v4');
const sqlite3 = require('sqlite3').verbose();
const dbService = require('./db');



module.exports = {
  getTodosByUserId: async (userId) => {
    return new Promise((resolve, reject) => {
      dbService.getDb().all('SELECT * FROM todos WHERE user = ?', [userId], function(error, rows) {
        error !== null ? reject(error) : null;

        resolve(rows);
      })
    });
  },
  addNew: async (todo) => {
    return new Promise((resolve, reject) => {
      dbService.run('INSERT INTO todos (user, description, status, dueDateTime, createdDateTime) VALUES(?, ?, ?, ?, ?)',
                   [todo.user, todo.description, todo.status, todo.dueDateTime, todo.createdDateTime])
        .then(result => {
          if(result.changes == 1) {
            resolve(true);
          }
          else {
            reject(false);
          }
        })
        .catch(error => reject(error));
    });
    /*
    {
        description: req.body.description,
        dueDateTime: req.body.dueDateTime,
        createdDateTime: now.toISOString(),
        status: 'open'
      }
    */

  }
}