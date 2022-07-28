const mysql = require('mysql2');
const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'dumb123',
  database: 'temlogicaDB',
  waitForConnections: true,
});

module.exports = connection 