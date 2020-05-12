const uuidv4 = require('uuid/v4');
const sqlite3 = require('sqlite3').verbose();
const dbService = require('./db');

function convertIsDoneFromIntegerToBoolean(arrayOfElements)
{
  arrayOfElements = arrayOfElements.map(r => {
    if(r.isDone) {
      r.isDone = true;
    } else {
      r.isDone = false;
    }
    return r;
  });
}

module.exports = {
  getTodosByUserId: async (userId) => {
    return new Promise((resolve, reject) => {
      dbService.getDb().all('SELECT * FROM todos WHERE user = ?', [userId], function(error, rows) {
        error !== null ? reject(error) : null;

        // This datatype conversion is here because sqlite does not have boolean datatype, only integer
        convertIsDoneFromIntegerToBoolean(rows);

        resolve(rows);
      })
    });
  },
  addNew: async (todo) => {
    return new Promise((resolve, reject) => {
      dbService.run('INSERT INTO todos (user, description, isDone, dueDateTime, createdDateTime) VALUES(?, ?, ?, ?, ?)',
                   [todo.user, todo.description, todo.isDone, todo.dueDateTime, todo.createdDateTime])
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
        isDone: false
      }
    */

  },
  getTodoById: async (todoId, userId) => {
    return new Promise((resolve, reject) => {
      dbService.getDb().get('SELECT * FROM todos WHERE id = ? AND user = ?', [todoId, userId], function(error, rows) {
        error !== null ? reject(error) : null;

        if(rows != undefined) {
          // This datatype conversion is here because sqlite does not have boolean datatype, only integer
          convertIsDoneFromIntegerToBoolean([rows]);
        }


        resolve(rows);
      });
    });
  },
  deleteTodoById: async (todoId, userId) => {
    return new Promise((resolve, reject) => {
      dbService.run('DELETE FROM todos WHERE id = ? AND user = ?', [todoId, userId])
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
  },
  updateTodoById: async (todoId, todoContent) => {
    return new Promise((resolve, reject) => {
      dbService.run(
        'UPDATE todos SET description = ?, isDone = ?, dueDateTime = ? WHERE id = ?',
        [todoContent.description, todoContent.isDone, todoContent.dueDateTime, todoId])
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
  }
}