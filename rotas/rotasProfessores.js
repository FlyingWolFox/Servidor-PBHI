const express = require('express');
const routerProfessores = express.Router()
const sql = require("../sql.js");
const sessao = require('../session');
const nanoid = require('nanoid').nanoid;
const send_mail = require('../sendmail.js');
const jwt = require('jsonwebtoken');
const useragent = require('express-useragent');
const AppError = require('../erros/appError.js');
const ValidationError = require('../erros/validationError.js');
const errorCodes = require('../erros/codeErrors.js');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const TOKEN_HEADER_KEY = process.env.TOKEN_HEADER_KEY
const tryCatch = require('../erros/tryCatch.js');

routerProfessores.use(useragent.express());

routerProfessores.post('/conferirCodigo', tryCatch(async (req, res) =>{
    const codigoS = req.body.codigo;
    if(!codigoS){
        throw new ValidationError("Preencha o código!", 400);
    }
    else{
        let email = await sql.getProfessorByCodigo(codigoS)
        if(email === undefined){
            throw new ValidationError("Código inválido!", 400);
        }
        if(email.toString().length > 0 && typeof email != undefined){
                let jwtSecretKey = JWT_SECRET_KEY;
                let data = {
                    email: email
                }
                const token = jwt.sign(data, jwtSecretKey);
                req.session.token = token;
                return res.redirect(302, '/professores/OpcoesProfessores.html');
            }
                throw new ValidationError("Código inválido!", 400);
    }
   })
);

routerProfessores.get('/OpcoesProfessores.html', tryCatch(async (req, res) =>{
    const token = req.session.token;
    console.log(token);
    const jwtSecretKey = JWT_SECRET_KEY
    const verificado = jwt.verify(token, jwtSecretKey);
    if(verificado){
        return  res.status(200).send("Sucesso")
    }else{
        throw new ValidationError("Acesso não autorizado", 401);
    }
   })
);

routerProfessores.post('/UpdateProfessorCodigo', tryCatch(async (req, res) =>{
    const email = req.body.email;
    const nome = req.body.nome;
    const id = nanoid(8);
    if(!email || !nome){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const professor = await sql.getProfessorByEmail(email);
    if(email === undefined){
        throw new ValidationError("Email inválido!", 400);
    }
    if(professor.length > 0){
            await sql.updateProfessor(email,id); 
            const enviado = await send_mail(email,id);
            if(!enviado){
                throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível enviar o email!", 500);
            }
           return res.status(200).send("Código atualizado com sucesso!")
    }else{
            await sql.salvarNovoProfessor(email,id,nome);
            const enviado = await send_mail(email,id);
            if(!enviado){
                throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível enviar o email!", 500);
            }
            return res.status(201).send("Código criado com sucesso!");
    }
   })
);
//=================================================== Funções de GET ==================================================
routerProfessores.get('/crieAtividade', tryCatch(async (req, res) =>{
    const token = req.session.token;
    const jwtSecretKey = JWT_SECRET_KEY
    const verificado = jwt.verify(token, jwtSecretKey)
    if(verificado){
        return res.status(302).redirect('/crieAtividade.html');
    }else{
        throw new ValidationError("Acesso não autorizado", 401);
    }
   })
);
routerProfessores.post('/getLink', tryCatch(async (req, res) =>{
    const id = nanoid(8)
    const datah_criacao = new Date()
    const intervalo  = datah_criacao.getTime() + (req.body.duracao*60*1000)
    const criacao_UTC = datah_criacao.toISOString().slice(0, 19).replace('T', ' ');
    const datah_expiracao = new Date();
    datah_expiracao.setTime(intervalo);
    const expiracao_UTC = datah_expiracao.toISOString().slice(0, 19).replace('T', ' ');
    if(!req.body.escola || !req.body.turma || !req.body.anoAtividade || !req.body.email || !req.body.nome_jogo){
            throw new ValidationError("Preencha todos os campos!", 400);
    }
    console.log(req.body)
    const atividadeCriada = await sql.insertAtividade(id, req.body.nomeProfessor, req.body.escola,req.body.turma, req.body.nome_jogo,req.body.anoAtividade, criacao_UTC, expiracao_UTC, req.body.email, req.body.comentarioAtividade,req.body.faseInicioAtividade,req.body.faseFimAtividade)
    if(atividadeCriada === undefined || atividadeCriada === null){
            throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível criar a atividade!", 500);
    }
    const URL = process.env.APP_URL+'/atividade/'+ id + '?fase=' + req.body.faseInicioAtividade
    return res.status(201).send(URL);
   })
);
routerProfessores.get('/getAtividades', tryCatch(async (req, res) =>{
    const token = req.session.token;
    const jwtSecretKey = JWT_SECRET_KEY
    const verificado = jwt.verify(token, jwtSecretKey)
    if(verificado){
        const parsedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const email = parsedToken['email']['email'];
        const atividades = await sql.getAtividadesPorEmail(email);
        if(!atividades){
            throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar as atividades!", 500);	
        }
       return res.status(200).json(atividades);
   }else{
        throw new ValidationError("Acesso não autorizado", 401);
   }
   })
);
routerProfessores.post('/getTempoMedio', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const tempoMedio = await sql.getTempoMedio(atividade);
    if(!tempoMedio){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar o tempo médio!", 500);
    }
    return res.status(200).json(tempoMedio);
   })
);
routerProfessores.post('/getNumeroDeJogadores', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const numeroJogadores = await sql.getNumeroDeJogadores(atividade);
    if(!numeroJogadores){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar o número de jogadores!", 500);
    }
    return res.status(200).json(numeroJogadores);
   })
);
routerProfessores.post('/getPartidasVencidas', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const partidasVencidas = await sql.getPartidasVencidas(atividade);
    if(!partidasVencidas){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar o número de partidas vencidas!", 500);
    }
    return res.status(200).json(partidasVencidas);
   })
);
routerProfessores.post('/getTaxaAcerto', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const taxaAcerto = await sql.getTaxaAcerto(atividade);
    if(!taxaAcerto){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar a taxa de acerto!", 500);
    }
    return res.status(200).json(taxaAcerto);
   })
);
routerProfessores.post('/getPartidasDaAtividade', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const partidas = await sql.getPartidasDaAtividade(atividade);
    if(!partidas){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar o número de partidas!", 500);
    }
    return res.status(200).json(partidas);
   })
);
routerProfessores.post('/getTentativas', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const tentativas = await sql.getTentativas(atividade);
    console.log(tentativas)
    if(!tentativas){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar as tentativas!", 500);
    }
    return res.status(200).json(tentativas);
   })
);
routerProfessores.post('/getNaoFinalizados', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const naoFinalizados = await sql.getNaoFinalizados(atividade);
    if(!naoFinalizados){
        throw new AppError(cerrorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar os não finalizados!", 500);
    }
    return res.status(200).json(naoFinalizados);
   })
);
routerProfessores.post('/getDadosAtividade', tryCatch(async (req, res) =>{
    const atividade = req.body.id_atividade;
    if(!atividade){
        throw new ValidationError("Preencha todos os campos!", 400);
    }
    const dadosAtividade = await sql.getDadosAtividade(atividade);
    if(!dadosAtividade){
        throw new AppError(errorCodes.ERRO_NO_BANCO_DE_DADOS,"Não foi possível buscar os dados!", 500);
    }
    return res.status(200).json(dadosAtividade);
   })
);
routerProfessores.all('*', (req,res)=>{ 
    return res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = routerProfessores