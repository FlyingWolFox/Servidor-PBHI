const express = require('express');
const routerProfessores = express.Router()
const sql = require("./sql.js");
const sessao = require('./session');
const nanoid = require('nanoid').nanoid;
const send_mail = require('./sendmail.js');

const useragent = require('express-useragent');

routerProfessores.use(useragent.express());

routerProfessores.post('/conferirProfessor', async (req, res, next) =>{
    const id = req.params.atividadeid;
    const atividade = await sql.getAtividadeById(id);
    if(atividade){
        res.redirect("./public_html/atividade/formAtividade.html")
    }else{
        res.status(404).send("Parece que o link da sua atividade expirou ou não existe!");
    }
    //todo: verificar se a atividade consta no bd e se ela ainda está válida, se não constar avisar que o link para essa atividade expirou ou não existe

    
    console.log(typeof(id));
    //res.json("Você veio do meu link especial e o id da sua atividade é:" + id);
   
})

routerProfessores.post('/conferirCodigo', async (req, res) => {
    const codigo = req.body.codigo;

    let resultado = await sql.getProfessorByCodigo(codigo)
    if(resultado.length > 0){
        console.log(resultado)
        res.json(resultado);
    }
})

routerProfessores.post('/setProfessorCodigo', async (req, res) => {
    const email = req.body.email;
    const nome = req.body.nome;
    const id = nanoid(8);

    await sql.salvarNovoProfessor(email,id,nome) 
    send_mail(email,id)
    res.json("Email enviado com sucesso!")
})

routerProfessores.post('/UpdateProfessorCodigo', async (req, res) => {
    
    const email = req.body.email;
    const id = nanoid(8);
    console.log(email)
    await sql.updateProfessor(email,id); 
    send_mail(email,id);
    res.json("Código atualizado com sucesso!")
})


routerProfessores.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = routerProfessores