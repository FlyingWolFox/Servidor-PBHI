const connection = require('./connection')

let comando = {};

comando.createTableAlunos = () => { //Cria uma tabela para os alunos
    connection.query(
        "create table if not exists alunos(id int auto_increment,nome varchar(30),ano varchar(30),primary key(id))",
        (err, results, fields) => {
          console.log(results); 
          console.log(fields); 
        }
      );
}

comando.addAluno = (nome,ano) => { //Adiciona os dados nome e ano à tabela alunos
  connection.query(
    "INSERT INTO alunos (nome,ano) VALUES ('"+nome+"','"+ano+"')",
    (err, results, fields) => {
      console.log(results); 
      console.log(fields); 
    }
  )
}

comando.createTableAlunos = () => {
  connection.query(
      "create table if not exists jogos(nome varchar(30),maxAno varchar(30),primary key(nome))",
      (err, results, fields) => {
        console.log(results); 
        console.log(fields); 
      }
    );
}

module.exports = comando;