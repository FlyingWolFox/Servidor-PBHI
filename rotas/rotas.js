//Colocando as rotas em arquivo separado

/* Arquivo de rotas default, aqui estão definidos os endpoints de comunicação dos jogos */
const express = require('express');
const routerDefault = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');
const useragent = require('express-useragent');
const ValidationError = require('../erros/validationError.js');
const AppError = require('../erros/appError.js');
const constante = require('../erros/codeErrors.js');
const tryCatch = require('../erros/tryCatch.js');


routerDefault.use(useragent.express());


routerDefault.post('/contato.html', tryCatch(async (req, res) =>{
     const nome = req.body.nome;
     const email = req.body.email;
     const texto = req.body.texto;
     if(!nome || !email){
        throw new ValidationError("Preencha todos os campos!", 400);
     }
     const contato = await sql.insertContato(nome, email, texto);
     if(contato){
         console.log(contato);
         return res.status(201).redirect('/');
     }else{
        throw new AppError(constante.ERRO_AO_CRIAR_USUARIO,"Erro ao criar usuário", 400);
     }    
    })
);
routerDefault.post('/interacoes', tryCatch(async (req, res) =>{
    const origem = req.body.origem;
    const destino = req.body.destino;
    const data_hora = req.body.data_hora;
    const tipoLigacao = req.body.tipoLigacao;
    const id_jogador = req.session.id_jogador;
    const nomeJogo = req.body.nomeJogo;
    const faseAtual = req.body.faseAtual;
    console.log(req.body);
    if(req.body){
       const id_interacao = await sql.insertInteracao(origem, destino, tipoLigacao, data_hora, nomeJogo, faseAtual, id_jogador);
        if(id_interacao === undefined){
            throw new AppError(constante.ERRO_AO_SALVAR_PARTIDA,"Erro ao salvar partida", 400)
        }
        return res.status(201).json('sucesso!');
    }else{
        throw new AppError(constante.ERRO_AO_SALVAR_PARTIDA,"Erro ao salvar partida", 400)
    }
})
);
routerDefault.post('/partida', tryCatch(async (req, res) =>{
        const nome_jogo = req.body.nomeJogo;
        const faseAtual = req.body.faseAtual;
        const tempoDeJogo = req.body.tempoDeJogo;
        const sucesso = req.body.sucesso;
        const id_jogador = req.session.id_jogador;
        const data_hora = req.body.data_hora;
        console.log(req.body);
        if(req.body){
            const id_partida =  await sql.insertPartida(nome_jogo,id_jogador, tempoDeJogo,data_hora, sucesso, faseAtual);
            if(id_partida === undefined){
                throw new AppError(constante.ERRO_AO_SALVAR_PARTIDA,"Erro ao salvar partida", 400)
            }
        return res.sendStatus(201).json('sucesso!');
     }else{
        throw new AppError(constante.ERRO_AO_SALVAR_PARTIDA, "Erro ao salvar partida", 400)
    }
})
);
routerDefault.post('/nome', tryCatch(async (req, res) =>{
    if(req.session.id_atividade){
        delete req.session.id_atividade;
    }
    req.session.regenerate((e) => {})
    const nome = req.body.nome;
    const ano = req.body.ano;
    if(nome == ""){
        throw new ValidationError('Nome não pode ser nulo', 400);
    }
    if(nome > 30){
        throw new ValidationError("Nome não pode ter mais de 30 caracteres", 400);
    }
        const id_jogador =  await sql.addAluno(nome, ano);
        req.session.id_jogador = id_jogador;
        req.session.nome = nome;
        req.session.ano = ano;
        req.session.logado = true;
        sessao.copySession(req);
        return res.status(201).json();
})
);

routerDefault.get('/getsession',(req,res) => {
   return res.json(sessao.getSession(req))
})
routerDefault.get('/getstatus',(req,res) => {
    return res.json(sessao.getStatus(req))
})
routerDefault.get('/changeStatus',(req,res)=>{
    req.session.logado = false;
  return res.json("");
})
routerDefault.get('/logout',  async (req, res)=>{
   return res.json(sessao.changeStatus(req))
})
routerDefault.get('/getJogos', async (req, res) => {
   const jogos = await sql.getJogos();
    return res.json(jogos);
})
routerDefault.get('/getAtividade', tryCatch(async (req, res) =>{
    console.log(req.session.id_atividade)
    if (req.session.id_atividade){
        const atividade = await sql.getAtividadeById(req.session.id_atividade);
        if(atividade === undefined){
            return res.status(200).send(false);
        }
        return res.status(200).json(atividade);
    }
    else{
        return res.status(200).send(false);
    }
})
);

routerDefault.all('*', (req,res)=>{ 
    return res.status(404).send('<h1>Recurso não encontrado</h1');
})

module.exports = routerDefault