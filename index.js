
/*const express = require('express');
const app = express();
const port = 3000;

const usersComponent = require('./routes/users');
const todosComponent = require('./routes/todos');


const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

// This is an error handling middleware, the function has four parameters.
// See https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling
app.use((err, req, res, next) => {
  res.status(err.status);
  console.error(err.toString());
  console.error('Path attempted - ' + req.path)
  res.send(err.toString());
});

app.use('/users', usersComponent);
app.use('/todos', todosComponent);

app.listen(port, () => {
  console.log(`Example API listening on http://localhost:${port}\n`);
});
*/



async function test()
{
  try {
    return await db.init();
  } catch (error) {
    console.log('tuut');
    console.log(error);
  }
  /*try {
    let res = await userService.getUserByName('john');
    return res;
  } catch (error) {
    console.log("2")
    return error;
  }*/

}

const userService = require('./services/users');
const db = require('./services/db');

//let res = userService.getUserById(1);
//console.log(res);

test().then(res => console.log("All ok"));