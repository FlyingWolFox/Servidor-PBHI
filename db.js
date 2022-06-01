
const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    password: "dumb123",
    user: "root",
    database: "temlogicaDB",
    host:"localhost",
});
let db = {};
db.getJogador = (id) =>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM jogador WHERE id= ?', [id], (error, user)=>{
            if(error){
                return reject(error);
            }
            return resolve(user);
        });
    });
};
db.getUserByEmail = (email) =>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM User WHERE email = ?', [email], (error, users)=>{
            if(error){
                return reject(error);
            }
            return resolve(users[0]);
        });
    });
};
db.insertContato = (nome, email, texto) =>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO contato (nome, email_contato, comentario) VALUES (?, ?, ?)', [nome, email, texto], (error, result)=>{
            if(error){
                return reject(error);
            }
            
              return resolve(result.insertId);
        });
    });
};
db.insertJogador = (nome, ano) =>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO jogador (nome, ano_jogador) VALUES (?, ?)', [nome, ano], (error, result)=>{
            if(error){
                return reject(error);
            }
            
              return resolve(result.insertId);
        });
    });
};
module.exports = db;