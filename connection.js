const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dumb123',
  database: 'temlogicaBD'
});

module.exports = connection