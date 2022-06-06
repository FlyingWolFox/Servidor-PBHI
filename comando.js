const connection = require('./connection')

let comando = {};

comando.createTableAlunos = () => { //Cria uma tabela para os alunos
    connection.query(
        "create table if not exists alunos(id int auto_increment,nome varchar(30),ano varchar(30),primary key(id))"
      );
}

comando.addAluno = (nome,ano) => { //Adiciona os dados nome e ano à tabela alunos
  connection.query(
    "INSERT INTO alunos (nome,ano) VALUES ('"+nome+"','"+ano+"')"
  )
}

comando.createTableJogos = () => { //Cria a tabela para armazenar os jogos
  connection.query(
      "create table if not exists jogos(nome varchar(30),nFases int,primary key(nome))"
    );
}

comando.addJogos = (nome,nFases) => { //Cria a tabela para armazenar os jogos
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('completar','24')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('completar numeros','24')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('repeticao','17')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('sequencia de numeros','24')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('criar padrao','17')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('grupos','40')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('logics','30')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('domino da diferenca','16')"
  );
  connection.query(
    "INSERT INTO jogos (nome,nFases) VALUES ('fluxograma','14')"
  );
}

comando.obterJogos = async () => {
  return new Promise(resolve => {
    connection.query("SELECT * FROM jogos",
      (error,results) => {
        resolve(results)
      }
    )
  })
}

module.exports = comando;