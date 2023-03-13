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

sessao.changeStatus = async (req) =>{ 
  const response = await deleteSession(req.session.id); //nao vale a pena indicar ao usuario o tipo de erro nessa situacao
  return response;
}

sessao.copySession = async (req) =>{
  const session_id = req.session.id;
  const id_jogador = req.session.id_jogador;
  const browser = req.useragent.browser;
  const platform = req.useragent.platform;
  const id_atividade = req.session.id_atividade;
  try{
    var response = await insertSession(session_id, id_jogador, browser, platform, id_atividade);

  }catch(err){
    console.log(err)
  }
  
  //if(response === undefined || response === null){
    //throw newAppError(ERRO_AO_SALVAR_SESSAO, "Erro ao salvar sessão", 400);
  //}
  //console.log('Sessão salva com sucesso');
  console.log('Dentro da função copySession, o valor de id_jogador é: ', id_jogador);
  return response;
}
module.exports = sessao;