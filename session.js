//Arquivo de funções pra manipulação da sessão
let sessao = {};

sessao.setSession = (req,nome,ano) => {
  req.session.nome = nome;
  req.session.ano  =  ano;
}

sessao.getSession = (req) => {
  let sessao = {
    id: req.session.id,
    nome: req.session.nome,
    ano: req.session.ano,
    id_jogador: req.session.id_jogador
  } 
  return sessao
}

module.exports = sessao;