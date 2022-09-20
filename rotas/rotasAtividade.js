const express = require('express');
const routerAtividade = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');


const useragent = require('express-useragent');
const { getAtividadeById } = require('../sql.js');



routerAtividade.use(useragent.express());


routerAtividade.get('/:atividadeid', async (req, res, next) =>{
    const id = req.params.atividadeid;
    const atividade = (await sql.getAtividadeById(id))[0];
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
        console.log(nome);
        const atividade_id = req.session.id_atividade
        const atividade = await sql.getAtividadeById(atividade_id)
        console.log(atividade)
        //puxa do bd a atividade, insere no bd o jogador(nome e ano) verifica qual é o jogo para depois redirecionar
        res.redirect("./selecao/jogos/repeticao/index.html")
    }

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