const mysql = require('mysql2');
const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'temlogicaDB',
  waitForConnections: true,
});

module.exports = connection 