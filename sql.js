const connection = require('./connection')
if(!connection){

}
let sql = {};
sql.getJogador = (id) =>{
    return new Promise((resolve, reject)=>{
        connection.query('SELECT * FROM jogador WHERE id_jogador = ?', [id], (error, jogador)=>{
            if(error){
                return reject(error);
            }
            return resolve(jogador);
        });
    });
};
sql.getJogadorByNomeAno = (nome, ano) =>{
    return new Promise((resolve, reject)=>{
        connection.query('SELECT * FROM jogador WHERE nome = ? AND ano_jogador = ?', [nome, ano], (error, result)=>{
            if(error){
                return reject(error);
            }
            return resolve(result[0]);
        });
    });
};
sql.insertContato = (nome, email, texto) =>{
    return new Promise((resolve, reject)=>{
        connection.query('INSERT INTO contato (nome, email_contato, comentario) VALUES (?, ?, ?)', [nome, email, texto], (error, result)=>{
            if(error){
                return reject(error);
            }
            
              return resolve(result.insertId);
        });
    });
};
sql.insertJogador = (nome, ano) =>{
    return new Promise((resolve, reject)=>{
        connection.query('INSERT INTO jogador (nome, ano_jogador) VALUES (?, ?)', [nome, ano], (error, result)=>{
            if(error){
                return reject(error);
            }
            
              return resolve(result.insertId);
        });
    });
};
//todo: inserir as manipulacoes de nó e de drop
sql.insertPartida = (nome_jogo,id_jogador, tempoDeJogo, sucesso, faseAtual) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO partida (nome_jogo, id_jogador, tempo_partida, sucesso, faseAtual) VALUES (?, ?, ?, ? ,?)', [nome_jogo, id_jogador, tempoDeJogo, sucesso, faseAtual], (error, result)=>{
          if(error){
              return reject(error);
          }
          
            return resolve(result.insertId);
      });
  });
};

sql.createTableAlunos = () => { //Cria uma tabela para os alunos
    connection.query(
        "create table if not exists alunos(id int auto_increment,nome varchar(30),ano varchar(30),primary key(id))"
      );
}
sql.addAluno = (nome,ano) => { //Adiciona os dados nome e ano à tabela alunos
  connection.query(
    "INSERT INTO alunos (nome,ano) VALUES ('"+nome+"','"+ano+"')"
  )
}
sql.createTableJogos = () => { //Cria a tabela para armazenar os jogos
  connection.query(
      "create table if not exists jogo(nome varchar(30),nFases int,primary key(nome))"
    );
}
sql.addJogos = () => { //Cria a tabela para armazenar os jogos
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('completar','24')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('completar numeros','24')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('repeticao','17')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('sequencia de numeros','24')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('criar padrao','17')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('grupos','40')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('logics','30')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('domino da diferenca','16')"
  );
  connection.query(
    "INSERT INTO jogo (nome_jogo,nFases) VALUES ('fluxograma','14')"
  );
}
sql.obterJogos = async () => { //Obtem as linhas da tabela jogo
  return new Promise(resolve => {
    connection.query("SELECT * FROM jogo",
      (error,results) => {
        resolve(results)
      }
    )
  })
}

module.exports = sql;