const Sequelize = require('sequelize');
const dbconfig = {
    dialect:'mysql',
    host:'localhost',
    username:'root',
    password:'12345',
    database:'temlogicaBD',
    port: 3306
};

const conection = new Sequelize(dbconfig);

module.exports = conection;