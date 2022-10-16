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
      connection.query('SELECT * FROM partidas_ganhas_por_nome where nome_jogo = "COMPLETAR"', (error, results)=>{
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
  sql.getTentativas = () =>{
    return new Promise((resolve, reject)=>{
        connection.query('select jogador.nome  as "Jogador", count((case when sucesso = 0 then 1 else null end)) as "Tentativas" from partida join jogador on partida.id_jogador = jogador.id_jogador where partida.nome_jogo = "COMPLETAR" group by fase_atual, nome having count((case when sucesso = 0 then 1 else null end)) >= 3'
        , (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };
    sql.getNaoFinalizados = () =>{
      return new Promise((resolve, reject)=>{
          connection.query('select jogador.nome, MAX(fase_atual) as UltimaFase, jogo.nFases as Total, (jogo.nFases) - MAX(fase_atual) as "NRespondidas" from partida join jogo on partida.nome_jogo = jogo.nome_jogo join jogador on partida.id_jogador = jogador.id_jogador where partida.nome_jogo = "COMPLETAR" group by partida.id_jogador having (jogo.nFases) - MAX(fase_atual) > 0 ', (error, results)=>{
              if(error){
                  return reject(error);
              }
             return resolve(results); 
           });
        });
      };
      sql.getTaxaAcerto = () =>{
        return new Promise((resolve, reject)=>{
            connection.query('select count((case when sucesso = 1 then 1 else null end)) as "acerto", count(*) as total, concat(round((count((case when sucesso = 1 then 1 else null end))/count(*)* 100), 2),'%') as "Taxa de Acerto" from partida where nome_jogo = "COMPLETAR"', (error, results)=>{
                if(error){
                    return reject(error);
                }
               return resolve(results); 
             });
          });
        };
    

  sql.getJogos = () =>{
    return new Promise((resolve, reject)=>{
        connection.query('select * from jogo;', (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };

  sql.getNumeroDeJogadores = () =>{
    return new Promise((resolve, reject)=>{
        connection.query('select count(distinct id_jogador) as "numeroJogadores" from partida where nome_jogo = "COMPLETAR";', (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };

    sql.getTempoMedio = () =>{
      return new Promise((resolve, reject)=>{
          connection.query('select avg(tempo_partida) as "tempoMedio" from partida where nome_jogo = "COMPLETAR";', (error, results)=>{
              if(error){
                  return reject(error);
              }
             return resolve(results); 
           });
        });
      };

  sql.getPartidasVencidas = () =>{
    return new Promise((resolve, reject)=>{
        connection.query('select count(*) as "partidasVencidas" from partida where sucesso = 1 and nome_jogo = "COMPLETAR";', (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };
sql.getJogadoresQuePrecisamDeAjuda = () =>{ //essa query só conta as tentivas que não tiveram sucesso, pra evitar de contar o jogador que jogou e acertou a mesma fase várias vezes
  // o default é que o jogador que errar a mesma fase 3 vezes ou mais precisa de ajuda, 
  return new Promise((resolve, reject)=>{
    connection.query('select jogador.nome  as "Jogador", count((case when sucesso = 0 then 1 else null end)) as "Tentativas", fase_atual from partida join jogador on partida.id_jogador = jogador.id_jogador where partida.nome_jogo = "COMPLETAR" group by fase_atual, nome having count((case when sucesso = 0 then 1 else null end)) >= 3;'
    , (error, results)=>{
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

sql.getJogoPorNome = (jogo) =>{
  return new Promise((resolve, reject)=>{
      connection.query('SELECT * FROM jogo WHERE nome_jogo = ?', [jogo], (error, result)=>{
          if(error){
              return reject(error);
          }
          return resolve(result[0]);
      });
  });
};

sql.insertAtividade = (id, nome_professor, escola, turma, jogo, ano, datah_criacao, datah_expiracao, email, comentario) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO atividade (id_atividade, professor_nome, escola, turma, jogo, ano, datah_criacao, datah_expiracao, professor_email, comentario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, nome_professor, escola ,turma, jogo, ano, datah_criacao, datah_expiracao, email, comentario], (error, result)=>{
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
        connection.query('INSERT INTO jogador (nome, ano) VALUES (?, ?)', [nome, ano], (error, result)=>{
            if(error){
                return reject(error);
            }
            
              return resolve(result.insertId);
        });
    });
};
//todo: inserir as manipulacoes de nó e de drop
sql.insertPartida = (nome_jogo,id_jogador,tempoDeJogo,data_hora, sucesso, fase_atual) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO partida (nome_jogo, id_jogador, tempo_partida, data_hora, sucesso, fase_atual) VALUES (?, ?, ?, ? ,?, ?)', [nome_jogo, id_jogador, tempoDeJogo, data_hora, sucesso, fase_atual], (error, result)=>{
          if(error){
              return reject(error);
          }
          
            return resolve(result.insertId);
      });
  });
};

sql.insertInteracao = (origem, destino, tipoLigacao, data_hora, nome_jogo, fase_atual,id_jogador) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO interacao (no_origem, no_destino, tipo_Ligacao, data_hora, nome_jogo, fase_atual, id_jogador ) VALUES (?, ?, ?, ? ,?, ?, ?)', [origem, destino, tipoLigacao, data_hora,nome_jogo, fase_atual,id_jogador], (error, result)=>{
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
    connection.query('INSERT INTO sessionp (id, id_jogador, navegador, plataforma) VALUES (?, ?, ?, ?)', [session_id, id_jogador, browser, platform], (error, result)=>{
        if(error){
            return reject(error);
        }
        
          return resolve(result.insertId);
    });
});
};

sql.addAluno = (nome,ano) => { //Adiciona os dados nome e ano à tabela alunos
  return new Promise((resolve) => {
    connection.query(
      "INSERT INTO jogador (nome,ano) VALUES ('"+nome+"','"+ano+"')", (error,result) => {
        resolve(result.insertId)
     }
    )
  })
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

//================================================================== PAGINA DE LOGIN E CADASTRO DE PROFESSORES =========================================================================

sql.salvarNovoProfessor = (email,id,nome) => {//Verifica o professor pelo código enviado
  return new Promise(resolve => {
    connection.query('insert into professor (email,codigo,nome_professor) values ("'+email+'","'+id+'","'+nome+'");',
      (error,results) => {
        if(error){console.log(error)}
        resolve(results)
      }
    )
  })
}
sql.updateProfessor = (email, codigo) => {
  return new Promise((resolve, reject)=>{
    connection.query('update professor set codigo = ? where email = ?', [codigo, email], (error, result)=>{
        if(error){
            return reject(error);
        }
        
          return resolve(result);
    });
});
}
sql.getProfessorByCodigo = (codigo) => {
  return new Promise(resolve => {
    connection.query('select * from professor where codigo="'+codigo+'";',
      (error,results) => {
        if(error){console.log(error)}
        resolve(results)
      }
    )
  })
}
sql.getProfessorByEmail = (email) => {
  return new Promise(resolve => {
    connection.query('select * from professor where email="'+email+'";',
      (error,results) => {
        if(error){console.log(error)}
        resolve(results)
      }
    )
  })
}

//================================================================== GETS E SETS DA ATIVIDADE =========================================================================
sql.getAtividadeById = (id) =>{
  return new Promise((resolve, reject)=>{
      connection.query('SELECT * FROM atividade WHERE id_atividade = ?', [id], (error, result)=>{
          if(error){
              return reject(error);
          }
          return resolve(result);
      });
  });
};

module.exports = sql;