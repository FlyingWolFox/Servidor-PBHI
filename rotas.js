const express = require('express');
const router = express.Router()
const sql = require("./sql.js");
const sessao = require('./session');
const { addJogos, obterJogos } = require('./sql.js');




router.use((req, res, next) => {
    req.session.init = "init";
    next();
});


router.post('/contato.html', async (req, res)=>{
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
router.post('/selecao/jogos', async (req,res)=>{
        const nome_jogo = req.body.nomeJogo;
        const faseAtual = req.body.faseAtual;
        const tempoDeJogo = req.body.tempoDeJogo;
        const sucesso = req.body.sucesso;
        //partida.browser = req.useragent.browser;
        //partida.platform = req.useragent.platform;
        //partida.geoIp = req.useragent.geoIp;
        const id_jogador = req.session.id_jogador;
        console.log(id_jogador);
        if(req.body){
        sql.insertPartida(nome_jogo,id_jogador, tempoDeJogo, sucesso, faseAtual);
         console.log(req.body);
         //EscreverJSON(partida);
         res.sendStatus(201);
     } else{
        res.sendStatus(404);
    }
})
router.post('/nome', async (req,res,next) => {
    req.session.regenerate((e) => {})
    const nome = req.body.nome;
    const ano = req.body.ano;

    var erros = [];

    if(nome == ""){
        erros.push({texto: "Nome não pode ser nulo"})
    }

    if(nome > 30){
        erros.push({texto: "Nome não pode ser ter mais de 30 caracteres"})
    }

    if(erros.length > 0){
        console.log(erros)
        res.json(erros)
    }
    else{
        const id_jogador =  await sql.addAluno(nome, ano);
        req.session.id_jogador = id_jogador;
        req.session.nome = nome;
        req.session.ano = ano;
        req.session.logado = true;
        res.json("")
    }
})
router.get('/addjogos', async (req,res) => {
    sql.createTableJogos()
    let jogos = await sql.obterJogos()
    if(jogos == '') sql.addJogos();
    else console.log("Jogos já foram adicionados");
})
router.get('/getstatus',(req,res) => {
    res.json(sessao.getStatus(req))
})
router.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = router