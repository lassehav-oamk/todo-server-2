const fs = require('fs')

const path = './db.test.sqlite'

try {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    console.log("Deleted " + path);
  }
  else {
    console.log('Test db does not exist, bypassing');
  }
} catch(err) {
  console.error(err)
}