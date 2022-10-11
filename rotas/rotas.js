//Colocando as rotas em arquivo separado

/* Arquivo de rotas default, aqui estão definidos os endpoints de comunicação dos jogos */
const express = require('express');
const routerDefault = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');

const nanoid = require('nanoid').nanoid;
const useragent = require('express-useragent');



routerDefault.use(useragent.express());


routerDefault.post('/contato.html', async (req, res)=>{
    try{
     const nome = req.body.nome;
     const email = req.body.email;
     const texto = req.body.texto;
     if(!nome || !email){
         return res.sendStatus(400);
     }
     const contato = await sql.insertContato(nome, email, texto);
     if(contato){
         console.log(contato);
         return res.redirect('/');
     }
    } catch(e){
        console.log(e);
        res.sendStatus(400);
    }
     
})    

routerDefault.post('/interacoes', async (req, res) =>{
    const origem = req.body.origem;
    const destino = req.body.destino;
    const data_hora = req.body.data_hora;
    const tipoLigacao = req.body.tipoLigacao;
    const id_jogador = req.session.id_jogador;
    const nomeJogo = req.body.nomeJogo;
    const faseAtual = req.body.faseAtual;
    if(req.body){
        await sql.insertInteracao(origem, destino, tipoLigacao, data_hora, id_jogador, nomeJogo, faseAtual);
        res.status(200).json('sucesso!');
    }else{
        res.status(400).json('Algo deu errado');
    }
})


routerDefault.post('/partida', async (req,res)=>{
        const nome_jogo = req.body.nomeJogo;
        const faseAtual = req.body.faseAtual;
        const tempoDeJogo = req.body.tempoDeJogo;
        const sucesso = req.body.sucesso;
        const id_jogador = req.session.id_jogador;
        const data_hora = req.body.data_hora;
        console.log(req.body);
        if(req.body){
        await sql.insertPartida(nome_jogo,id_jogador, tempoDeJogo,data_hora, sucesso, faseAtual);
         console.log(req.body);
         //EscreverJSON(partida);
         res.sendStatus(201);
     } else{
        res.sendStatus(404);
    }
})


routerDefault.post('/nome', async (req,res,next) => {
    console.log("Passei1")
    req.session.regenerate((e) => {})
    console.log("Passei2")
    const nome = req.body.nome;
    const ano = req.body.ano;

    var erros = [];

    if(nome == ""){
        erros.push({texto: "Nome não pode ser nulo"})
    }

    if(nome > 30){
        erros.push({texto: "Nome não pode ter mais de 30 caracteres"})
    }

    if(erros.length > 0){
        console.log(erros)
        res.json(erros)
    }else{
        const id_jogador =  await sql.addAluno(nome, ano);
        req.session.id_jogador = id_jogador;
        req.session.nome = nome;
        req.session.ano = ano;
        req.session.logado = true;
        sessao.copySession(req);
        res.json("");
    }
   
})
routerDefault.get('/getTempoMedio', async (req, res) =>{
    const tempoMedio = await sql.getTempoMedio();
    if(tempoMedio){
        res.json(tempoMedio);
    } else console.log('Algo deu errado');
})
routerDefault.get('/getNumeroDeJogadores', async (req, res) =>{
    const numeroJogadores = await sql.getNumeroDeJogadores();
    if(numeroJogadores){
        res.json(numeroJogadores);
    } else console.log('Algo deu errado');
})
routerDefault.get('/getPartidasVencidas', async (req, res) =>{
    const partidasVencidas = await sql.getPartidasVencidas();
    if(partidasVencidas){
        res.json(partidasVencidas);
    } else console.log('Algo deu errado');
})
routerDefault.get('/getTentativas', async (req,res) => {
    let fields = await sql.getTentativas();
    if(fields){
        res.json(fields);
    }
    else console.log("deu merda");
})
routerDefault.get('/getNaoFinalizados', async (req,res) => {
    let fields = await sql.getNaoFinalizados();
    if(fields){
        res.json(fields);
    }
    else console.log("deu merda");
})
routerDefault.get('/getTempoExpirado', async (req,res) => {
    let fields = {"nome": "Mariana"}
    if(fields){
        res.json(fields);
    }
    else console.log("deu merda");
})
routerDefault.get('/getMelhoresJogadores', async (req,res) => {
    let fields = {"nome": "Vidal"}
    if(fields){
        res.json(fields);
    }
    else console.log("deu merda");
})
routerDefault.get('/getTaxaAcerto', async (req,res) => {
    let fields = await sql.getTaxaAcerto();
    if(fields){
        res.json(fields);
    }
    else console.log("deu merda");
})
routerDefault.get('/getAllPartidas', async (req,res) => {
    let fields = await sql.getAllPartidas();
    if(fields){
        res.json(fields); 
    }
    else console.log("deu merda");
})
routerDefault.get('/getsession',(req,res) => {
    res.json(sessao.getSession(req))
})
routerDefault.get('/getstatus',(req,res) => {
    res.json(sessao.getStatus(req))
})
routerDefault.get('/changeStatus',(req,res)=>{
    req.session.logado = false;
   res.json("");
})
routerDefault.get('/logout',  async (req, res)=>{
    
   res.json(sessao.changeStatus(req))
})
routerDefault.get('/getJogos', async (req, res) => {
   const jogos = await sql.getJogos();
    res.json(jogos);
})

routerDefault.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = routerDefault