const express = require('express');
const routerAtividade = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');
const tryCatch = require('../erros/tryCatch.js');
const useragent = require('express-useragent');
const { getAtividadeById, insertJogador } = require('../sql.js');
const { copySession } = require('../session');
const ValidationError = require('../erros/validationError.js');
const AppError = require('../erros/appError.js');
const constante = require('../erros/codeErrors.js');


routerAtividade.use(useragent.express());

routerAtividade.get('/:atividadeid', tryCatch(async (req, res) =>{
    const id = req.params.atividadeid;
    console.log(id)
    const atividade = (await sql.getAtividadeById(id))[0];
    req.session.id_atividade = atividade;
    console.log("Atividade: "+atividade.fase_inicio)
    console.log("Atividade: "+atividade.fase_fim)
    console.log(atividade.datah_expiracao);
    const horaAtual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const expira = atividade.datah_expiracao.toISOString().slice(0,19).replace('T', ' ');
    if(atividade){
        if(horaAtual < expira){
            req.session.id_atividade = id;
            console.log(horaAtual, expira);
            res.redirect("../atividade/recepcaoAtividade.html");
            
        }else{
            throw new ValidationError("Parece que o link da sua atividade expirou ou não existe!", 404);
        }
        
    }else{
        throw new ValidationError("Parece que o link da sua atividade expirou ou não existe!", 404);
    }
   })
);
routerAtividade.post('/formAtividade.html', tryCatch(async (req, res) =>{
    const nome = req.body.nome;
    if(!nome){
        throw new ValidationError("Preencha todos os campos!", 404);
    }
    const atividade_id = req.session.id_atividade
    const atividade = await sql.getAtividadeById(atividade_id);
    if(!atividade){
        throw new ValidationError("Parece que o link da sua atividade expirou ou não existe!", 404);
    }    
    const id_jogador = await insertJogador(nome, atividade[0].ano);
    if(!id_jogador){
        throw new AppError(constante.ERRO_AO_CRIAR_USUARIO,400)
    }
    req.session.id_jogador = id_jogador;
    const diretorio = (await sql.getJogoPorNome(atividade[0].jogo)).diretorio;
    if(!diretorio){
        throw new AppError(constante.ERRO_NO_BANCO_DE_DADOS, "Erro ao encontrar atividade",400)
    }
    copySession(req)
    console.log('../'+ diretorio + '?fase=' + atividade[0].fase_inicio)
    return res.redirect('../'+ diretorio + '?fase=5');
   })
);

//=================================================== Funções de GET ==================================================

routerAtividade.post('/getSessionAtividade',  async (req, res) =>{
    const atividade_id = req.session.id_atividade
    const atividade = await sql.getAtividadeById(atividade_id)
    if(!atividade){
        throw new AppError(constante.ERRO_NO_BANCO_DE_DADOS, "Erro ao encontrar atividade",400)
    }else{
        res.status(200).json(atividade)
    } 
})

routerAtividade.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = routerAtividade