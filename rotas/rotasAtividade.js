const express = require('express');
const routerAtividade = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');


const useragent = require('express-useragent');
const { getAtividadeById, insertJogador } = require('../sql.js');



routerAtividade.use(useragent.express());


routerAtividade.get('/:atividadeid', async (req, res, next) =>{
    const id = req.params.atividadeid;
    console.log(id)
    const atividade = (await sql.getAtividadeById(id))[0];
    req.session.id_atividade = atividade;
    console.log("Atividade: "+atividade)
    console.log(atividade.datah_expiracao);
    const horaAtual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const expira = atividade.datah_expiracao.toISOString().slice(0,19).replace('T', ' ');
    if(atividade){
        if(horaAtual < expira){
            req.session.id_atividade = id;
            console.log(horaAtual, expira);
            res.redirect("../atividade/recepcaoAtividade.html");
            
        }else{
            res.status(404).send("Parece que o link da sua atividade expirou ou não existe!");
        }
        
    }else{
        res.status(404).send("Parece que o link da sua atividade expirou ou não existe!");
    }
    //todo: verificar se a atividade consta no bd e se ela ainda está válida, se não constar avisar que o link para essa atividade expirou ou não existe

    
    console.log(typeof(atividade));
    //res.json("Você veio do meu link especial e o id da sua atividade é:" + id);
   
})

routerAtividade.post('/formAtividade.html',  async (req, res) =>{
    const nome = req.body.nome;
    if(nome){
        const atividade_id = req.session.id_atividade
        console.log(atividade_id)
        const atividade = await sql.getAtividadeById(atividade_id);
        console.log(atividade)
        const id_jogador = await insertJogador(nome, atividade[0].ano);
        req.session.id_jogador = id_jogador;
        const diretorio = (await sql.getJogoPorNome(atividade[0].jogo)).diretorio;
        //puxa do bd a atividade, insere no bd o jogador(nome e ano) verifica qual é o jogo para depois redirecionar
        console.log(diretorio)
        res.redirect('../'+ diretorio);
    }else{res.status(404).send("Preencha todos os campos!")}

}) 

//=================================================== Funções de GET ==================================================

routerAtividade.post('/getSessionAtividade',  async (req, res) =>{
    const atividade_id = req.session.id_atividade
    const atividade = await sql.getAtividadeById(atividade_id)
    res.json(atividade)
})

routerAtividade.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = routerAtividade