const Sequelize = require('sequelize')
const database = require('./connection')

const Aluno = database.define('aluno',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome:{
        type: Sequelize.STRING,
        allowNull: false
    },
    ano:{
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Aluno;