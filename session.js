//Arquivo de funções pra manipulação da sessão
let sessao = {};

sessao.setSession = (req,nome,ano) => {
  req.session.nome = nome;
  req.session.ano  =  ano;
  // req.session.id_jogador = null;
}

// sessao.getSession = (req) => {
//   let sessao = {
//     id: req.session.id,
//     nome: req.session.nome,
//     ano: req.session.ano,
//     id_jogador: req.session.id_jogador,
//     logado: req.session.logado
//   } 
//   return sessao
// }

sessao.getStatus = (req) => {
  let log;
  req.session.logado == true ? log = true: log = false;
  return log
}

module.exports = sessao;