const connection = require('./connection');
const errorCodes = require('./erros/codeErrors');
const AppError = require('./erros/AppError');

if(connection === undefined){
    throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível conectar ao banco de dados!", 500);
}
if(!connection){
    throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível conectar ao banco de dados!", 500);
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
sql.getPartidasDaAtividade = (id_atividade) =>{
  return new Promise((resolve, reject)=>{
      connection.query('SELECT nome, nome_jogo, fase_atual, tempo_partida, sucesso FROM partida join jogador on partida.id_jogador = jogador.id join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ?',[id_atividade], (error, results)=>{
          if(error){
              return reject(error);
          }
         return resolve(results); 
       });
    });
  };
  sql.getTentativas = (id_atividade) =>{
    return new Promise((resolve, reject)=>{
        connection.query('select jogador.nome, count(distinct jogador.nome) as "NumeroJogadores",count((case when sucesso = 0 then 1 else null end)) as "Tentativas" from partida join jogador on partida.id_jogador = jogador.id join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ? group by fase_atual, nome having count((case when sucesso = 0 then 1 else null end)) >= 3',[id_atividade], (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };
    sql.getNaoFinalizados = (id_atividade) =>{
      return new Promise((resolve, reject)=>{
          connection.query('select jogador.nome, count(distinct jogador.nome) as "NumeroJogadores", jogo.max_fase as Total, (jogo.max_fase) - MAX(fase_atual) as "NRespondidas" from partida join jogo on partida.nome_jogo = jogo.nome_jogo join jogador on partida.id_jogador = jogador.id join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ? group by partida.id_jogador having (jogo.max_fase) - MAX(fase_atual) > 0 ',[id_atividade],(error, results)=>{
              if(error){
                  return reject(error);
              }
             return resolve(results); 
           });
        });
      };
      sql.getDadosAtividade = (id_atividade) =>{
        return new Promise((resolve, reject)=>{
            connection.query('select professor_nome, datah_criacao, datah_expiracao from atividade where id_atividade = ?',[id_atividade],(error, results)=>{
                if(error){
                    return reject(error);
                }
               return resolve(results); 
             });
          });
        };
      sql.getTaxaAcerto = (id_atividade) =>{
        return new Promise((resolve, reject)=>{
            connection.query('select concat(round((count((case when sucesso = 1 then 1 else null end))/count(*)* 100), 0)) as "taxaAcerto" from partida join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ?', [id_atividade], (error, results)=>{
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

  sql.getNumeroDeJogadores = (id_atividade) =>{
    return new Promise((resolve, reject)=>{
        connection.query('select count(distinct partida.id_jogador) as "numeroJogadores" from partida join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ?;', [id_atividade], (error, results)=>{
            if(error){
                return reject(error);
            }
           return resolve(results); 
         });
      });
    };

    sql.getTempoMedio = (id_atividade) =>{
      return new Promise((resolve, reject)=>{
          connection.query('select round(avg(tempoTotal)/60,2) as "tempoMedio" from (select sum(tempo_partida) as tempoTotal from partida join jogador on partida.id_jogador = jogador.id join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ? group by partida.id_jogador)nested;', [id_atividade], (error, results)=>{
              if(error){
                  return reject(error);
              }
             return resolve(results); 
           });
        });
      };

  sql.getPartidasVencidas = (id_atividade) =>{
    return new Promise((resolve, reject)=>{
        connection.query('select count(*) as "partidasVencidas" from partida join sessionp on partida.id_jogador = sessionp.id_jogador where id_atividade = ? and sucesso = 1;', [id_atividade], (error, results)=>{
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
sql.getAtividadesPorEmail = (email) =>{
  return new Promise((resolve, reject)=>{
    connection.query('SELECT id_atividade from atividade where professor_email = ? order by datah_criacao desc', [email], (error, results)=>{
        if(error){
            return reject(error);
        }
        return resolve(results);
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

sql.insertAtividade = (id, nome_professor, escola, turma, jogo, ano, datah_criacao, datah_expiracao, email, comentario, faseInicio, faseFim) =>{
  return new Promise((resolve, reject)=>{
      connection.query('INSERT INTO atividade (id_atividade, professor_nome, escola, turma, jogo, ano, datah_criacao, datah_expiracao, professor_email, comentario, fase_inicio, fase_fim) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, nome_professor, escola ,turma, jogo, ano, datah_criacao, datah_expiracao, email, comentario, faseInicio,faseFim], (error, result)=>{
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

sql.insertSession = (session_id, id_jogador, browser, platform, id_atividade) =>{
  return new Promise((resolve, reject)=>{
    connection.query('INSERT INTO sessionp (id, id_jogador, navegador, plataforma, id_atividade) VALUES (?, ?, ?, ?, ?)', [session_id, id_jogador, browser, platform, id_atividade], (error, result)=>{
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
    connection.query('select email from professor where codigo="'+codigo+'";',
      (error,results) => {
        if(error){console.log(error)}
        resolve(results[0])
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