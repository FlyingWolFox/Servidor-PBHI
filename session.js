const session = require("express-session");
const AppError = require("./erros/appError");
const tryCatch = require("./erros/tryCatch");
const { ERRO_AO_SALVAR_SESSAO } = require("./erros/codeErrors");
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

sessao.changeStatus = tryCatch(async (req, res) =>{ 
  const response = await deleteSession(req.session.id); //nao vale a pena indicar ao usuario o tipo de erro nessa situacao
  if(response === undefined || response === null){
    throw new AppError("Algo deu errado",ERRO_AO_SALVAR_SESSAO, 500);
  }else if(!response){
    throw new AppError("Algo deu errado",ERRO_AO_SALVAR_SESSAO, 500);
  }
  return response;
 })

sessao.copySession = tryCatch(async (req, res) =>{
  const session_id = req.session.id;
  const id_jogador = req.session.id_jogador;
  const browser = req.useragent.browser;
  const platform = req.useragent.platform;
  const id_atividade = req.session.id_atividade;
  const response = await insertSession(session_id, id_jogador, browser, platform, id_atividade);
  if(response === undefined || response === null){ //nao vale a pena indicar ao usuario o tipo de erro nessa situacao
    throw new AppError("Algo deu errado",ERRO_AO_SALVAR_SESSAO, 500);
  }else if(!response){
    throw new AppError("Algo deu errado",ERRO_AO_SALVAR_SESSAO, 500);
  }
  return response;
 })
module.exports = sessao;