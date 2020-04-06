const fs = require('fs')

const path = './db.test.sqlite'

try {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
} catch(err) {
  console.error(err)
}