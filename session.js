const session = require("express-session");
const { insertSession, deleteSession } = require("./sql");
const sql = require("./sql");
// Arquivo de funções pra manipulação da sessão
let sessao = {};

sessao.setSession = (req,nome,ano) => {
  req.session.nome = nome;
  req.session.ano  =  ano;
  // req.session.id_jogador = null;
}

 sessao.getSession = (req) => {
  let sessao = {
    id: req.session.id,
    nome: req.session.nome,
  ano: req.session.ano,
    id_jogador: req.session.id_jogador,
     logado: req.session.logado,
   } 
   return sessao
 }

sessao.getStatus = (req) => {
  let log;
  req.session.logado == true ? log = {logado : true, ano: req.session.ano, nome:req.session.nome}:  log = {logado : false, ano: req.session.ano};
  return log
}

sessao.changeStatus = async (req) => {
 const response = await deleteSession(req.session.id);
 return response;
 
}
sessao.copySession = async (req) =>{
  const session_id = req.session.id;
  const id_jogador = req.session.id_jogador;
  const browser = req.useragent.browser;
  const platform = req.useragent.platform;
  const id_atividade = req.session.id_atividade;
  const response = await insertSession(session_id, id_jogador, browser, platform, id_atividade);
  return response;
}
module.exports = sessao;