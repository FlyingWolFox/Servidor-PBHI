const express = require('express')
const app = express()

let sessao = {};

sessao.setSession = (req,nome,ano) => {
  req.session.nome = nome;
  req.session.ano  =  ano;
}

sessao.getSession = (req) => {
  let sessao = {
    id: req.session.id,
    nome: req.session.nome,
    ano: req.session.ano
  } 
  return sessao
}

module.exports = sessao;