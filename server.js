const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbService = require('./services/db');

const app = express();
const port = 3000;
let server = null;

const usersComponent = require('./routes/users');
const todosComponent = require('./routes/todos');

app.use(bodyParser.json());
app.use(cors());



app.use('/users', usersComponent);
//app.use('/todos', todosComponent);

// This is an error handling middleware, the function has four parameters.
// See https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling
app.use((err, req, res, next) => {
  if(err.hasOwnProperty('status') == true)
  {
    const date = new Date();
    console.error(date.toUTCString() + ' - ' + err.toString());
    console.error('Path attempted - ' + req.path)

    res.status(err.status);
    res.json({
      reason: err.toString()
    });
  }
  else
  {
    next();
  }

});



/* Export a function to close the server for test purposes */
module.exports = {
  close: function()
  {
    server.close();
  },
  start: function(mode)
  {
    let databaseName = 'db.sqlite';
    if(mode == "test")
    {
      databaseName = 'db.test.sqlite';
    }
    dbService.init(databaseName).then(result => {
      server = app.listen(port, () => {
        console.log(`Example API listening on http://localhost:${port}\n`);
      });
    })
    .catch(error => {
      console.log("DB init error");
      console.log(error);
    })
  }
}


