const sqlite3 = require('sqlite3').verbose();

let db = null;

async function openDb(dbName)
{
  return new Promise((resolve, reject) => {

    db = new sqlite3.Database(dbName, function(error) {
      if(error !== null) {
        reject(error);
        return;
      }
      resolve();
    })
  });
}

async function closeDb()
{
  return new Promise((resolve, reject) => {
    db.close(function(error) {
      if(error !== null) {
        reject(error);
        return;
      }

      db = null;
      resolve();
    })
  });
}

async function createTables()
{
  return new Promise((resolve, reject) => {
    run(
      `CREATE TABLE IF NOT EXISTS "users" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "username"	TEXT NOT NULL,
      "password"	TEXT NOT NULL
      )`,
      []
    )
    .then(() => {
      run(
        `CREATE TABLE IF NOT EXISTS "todos" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "user"	INTEGER NOT NULL,
        "description"	TEXT NOT NULL,
        "status"	TEXT NOT NULL,
        "dueDateTime"	TEXT NOT NULL,
        "createdDateTime"	INTEGER NOT NULL
        )`,
        []
      )
      .then(() => resolve())
    })
    .catch((error) => reject(error));
  });
}

async function run(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(error) {
          if(error !== null) {
            reject(error);
            return;
          }
          resolve(this.lastID);
        });
  });
}


module.exports = {
  getDb: () => db,
  init: async () => {
    return openDb('db.sqlite').
      then(() => createTables());
  },
  close: async () => {
    return closeDb();
  },
  run: run,
}