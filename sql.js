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
sql.getAllPartidas = () =>{
  return new Promise((resolve, reject)=>{
      connection.query('SELECT * FROM partidas_ganhas_por_nome', (error, results)=>{
          if(error){
              return reject(error);
          }
          /*for (let index in results) {
            if (results.hasOwnProperty(index)) {
               console.log(index, results[index].nome_jogo);
            }
         }*/
         return resolve(results); 
       });
    });
  };
  sql.getNumeroDeJogadores = () =>{
    return new Promise((resolve, reject)=>{
        connection.query('select count(distinct id_jogador) as "numeroJogadores" from partida;', (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };

    sql.getTempoMedio = () =>{
      return new Promise((resolve, reject)=>{
          connection.query('select avg(tempo_partida) as "tempoMedio" from partida;', (error, results)=>{
              if(error){
                  return reject(error);
              }
             return resolve(results); 
           });
        });
      };

  sql.getPartidasVencidas = () =>{
    return new Promise((resolve, reject)=>{
        connection.query('select count(*) as "partidasVencidas" from partida where sucesso = 1;', (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
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
sql.getAtividadeById = (id) =>{
  return new Promise((resolve, reject)=>{
      connection.query('SELECT * FROM atividade WHERE id_atividade = ?', [id], (error, result)=>{
          if(error){
              return reject(error);
          }
          return resolve(result[0]);
      });
  });
};
sql.insertAtividade = (id, nome_professor, turma, jogo, ano, datah_criacao, datah_expiracao) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO atividade (id_atividade, professor_nome, turma, jogo, ano) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, nome_professor, turma, jogo, ano, datah_criacao, datah_expiracao], (error, result)=>{
          if(error){
              return reject(error);
          }
          
            return resolve(result.insertId);
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
sql.insertPartida = (nome_jogo,id_jogador,tempoDeJogo,data_hora, sucesso, faseAtual) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO partida (nome_jogo, id_jogador, tempo_partida, data_hora, sucesso, faseAtual) VALUES (?, ?, ?, ? ,?, ?)', [nome_jogo, id_jogador, tempoDeJogo, data_hora, sucesso, faseAtual], (error, result)=>{
          if(error){
              return reject(error);
          }
          
            return resolve(result.insertId);
      });
  });
};

sql.insertInteracao = (origem, destino, tipoLigacao, data_hora,id_jogador, nome_jogo, faseAtual) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO interacoes (no_origem, no_destino, tipo_Ligacao, data_hora, id_jogador, nome_jogo, faseAtual ) VALUES (?, ?, ?, ? ,?, ?, ?)', [origem, destino, tipoLigacao, data_hora,id_jogador,nome_jogo, faseAtual], (error, result)=>{
          if(error){
              return reject(error);
          }
          
            return resolve(result.insertId);
      });
  });
};
sql.deleteSession = (id) =>{
  return new Promise((resolve, reject)=>{
      connection.query('DELETE FROM sessions WHERE session_id = ?', [id], (error, result)=>{
          if(error){
              return reject(error);
          }
          return resolve(result);
      });
  });
};

sql.insertSession = (session_id, id_jogador, browser, platform) =>{
  return new Promise((resolve, reject)=>{
    connection.query('INSERT INTO sessionp (idsessionP, id_jogador, browser, platform) VALUES (?, ?, ?, ?)', [session_id, id_jogador, browser, platform], (error, result)=>{
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
  return new Promise((resolve) => {
    connection.query(
      "INSERT INTO jogador (nome,ano_jogador) VALUES ('"+nome+"','"+ano+"')", (erro,result) => {
        resolve(result.insertId)
     }
    )
  })
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