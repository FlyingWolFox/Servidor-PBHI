const express = require('express');
const routerProfessores = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');
const nanoid = require('nanoid').nanoid;
const send_mail = require('../sendmail.js');
const jwt = require('jsonwebtoken');
const useragent = require('express-useragent');

const JWT_SECRET_KEY = "sakpodkafau23482903423948alkdasdajopk";
  
const TOKEN_HEADER_KEY = "gfg_token_header_key";

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
    const codigoS = req.body.codigo;

    if(!codigoS) {res.status(401).send("Preencha o código!")}
    else{
        let email = await sql.getProfessorByCodigo(codigoS)
        console.log(email)
        if(email != undefined & email.toString().length > 0){
                let jwtSecretKey = JWT_SECRET_KEY;
                let data = {
                    email: email
                }
              
                const token = jwt.sign(data, jwtSecretKey);
                console.log(token)
                req.session.token = token;
                res.redirect(302, '/professores/OpcoesProfessores.html');
            }
           else{
                res.status(401).send("Código inválido!");
           }
    }
})

routerProfessores.get('/OpcoesProfessores.html', async (req, res) => {
    const token = req.session.token;
    console.log(token);
    const jwtSecretKey = JWT_SECRET_KEY
    const verificado = jwt.verify(token, jwtSecretKey)
    
    if(verificado){
         res.send("Sucesso")
    }else{
        res.status(401).send("Acesso não autorizado")
    }
})

routerProfessores.post('/UpdateProfessorCodigo', async (req, res) => {

    const email = req.body.email;
    const nome = req.body.nome;

    if(!email || !nome) {res.status(404).send("Preencha todos os campos!")}
    else{
        const id = nanoid(8);

        try{
            await send_mail(email,id)
            const professor = await sql.getProfessorByEmail(email);

            if(professor.length > 0){
                await sql.updateProfessor(email,id); 
                res.status(200).send("Código atualizado com sucesso!")
            }else{
                await sql.salvarNovoProfessor(email,id,nome) 
                res.status(200).send("Código criado com sucesso!")
            }
        }catch{
            res.status(404).send("Não foi possível mandar o email!")
        }
    }
})

routerProfessores.get('/crieAtividade', async (req, res) => {
    const token = req.session.token;
    console.log(token);
    const jwtSecretKey = JWT_SECRET_KEY
    const verificado = jwt.verify(token, jwtSecretKey)
    
    if(verificado){
         res.redirect('/crieAtividade.html');
    }else{
        res.status(401).send("Acesso não autorizado")
    }
})

//=================================================== Funções de GET ==================================================
routerProfessores.post('/getLink', async (req, res)=>{
    const id = nanoid(8)
    const datah_criacao = new Date()
    const intervalo  = datah_criacao.getTime() + (req.body.duracao*60*1000)
    const criacao_UTC = datah_criacao.toISOString().slice(0, 19).replace('T', ' ');
    const datah_expiracao = new Date();
    datah_expiracao.setTime(intervalo);
    const expiracao_UTC = datah_expiracao.toISOString().slice(0, 19).replace('T', ' ');
    // console.log(criacao_UTC, expiracao_UTC);

    if(!req.body.escola || !req.body.turma || !req.body.anoAtividade || !req.body.email || !req.body.nome_jogo){
        res.status(404).send("Preencha todos os campos!")
    }else{
        try{
            await sql.insertAtividade(id, req.body.nomeProfessor, req.body.escola,req.body.turma, req.body.nome_jogo,req.body.anoAtividade, criacao_UTC, expiracao_UTC, req.body.email, req.body.comentarioAtividade,req.body.faseInicioAtividade,req.body.faseFimAtividade)
            const URL = process.env.APP_URL+'/atividade/'+ id
            console.log(req.body);
    
            res.status(200).send(URL);
        }catch{
            res.status(401).send("É necessário ter um email cadastrado!")
        }
    }  
})
routerProfessores.get('/getAtividades', async(req, res)=>{
    console.log('passei no get')
    const token = req.session.token;
    const jwtSecretKey = JWT_SECRET_KEY
    const verificado = jwt.verify(token, jwtSecretKey)
    if(verificado){
        const parsedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        console.log(parsedToken)
        const email = parsedToken['email']['email'];
        
        console.log(email);
        const atividades = await sql.getAtividadesPorEmail(email);
        res.status(200).json(atividades);
   }else{
       res.status(401).send("Acesso não autorizado")
   }
})
routerProfessores.post('/getTempoMedio', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const tempoMedio = await sql.getTempoMedio(atividade);
    if(tempoMedio){
        res.json(tempoMedio);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getNumeroDeJogadores', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const numeroJogadores = await sql.getNumeroDeJogadores(atividade);
    if(numeroJogadores){
        res.json(numeroJogadores);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getPartidasVencidas', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const partidasVencidas = await sql.getPartidasVencidas(atividade);
    if(partidasVencidas){
        res.json(partidasVencidas);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getPartidasDaAtividade', async (req, res) =>{
    const atividade = req.body.id_atividade;
    console.log(atividade);
    const partidas = await sql.getPartidasDaAtividade(atividade);
    if(partidas){
        res.json(partidas);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getTaxaAcerto', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const taxaAcerto = await sql.getTaxaAcerto(atividade);
    console.log(taxaAcerto);
    if(taxaAcerto){
        res.json(taxaAcerto);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getTentativas', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const tentativas = await sql.getTentativas(atividade);
    if(tentativas){
        console.log(tentativas)
        res.json(tentativas);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getNaoFinalizados', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const naoFinalizados = await sql.getNaoFinalizados(atividade);
    if(naoFinalizados){
        res.json(naoFinalizados);
    } else console.log('Algo deu errado');
})
routerProfessores.post('/getDadosAtividade', async (req, res) =>{
    const atividade = req.body.id_atividade;
    const dadosAtividade = await sql.getDadosAtividade(atividade);
    if(dadosAtividade){
        res.json(dadosAtividade);
    } else console.log('Algo deu errado');
})
routerProfessores.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = routerProfessores