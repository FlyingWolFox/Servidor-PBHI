const express = require('express');
const router = express.Router()
const db = require("./db.js");
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const mysql = require('mysql');
function EscreverJSON(objeto){
    var dadosJson = objeto;
    var conteudoJson = JSON.stringify(dadosJson,null, 2 );
    fs.appendFile("testes.json", conteudoJson, 'utf-8', function(err){
        if(err){
            console.log("ocorreu um erro escrevendo um objeto json no arquivo");
        }
    console.log('o arquivo json foi salvo.')    
    })
}
const TWO_HOURS = 1000 * 60 * 60 * 2
//criando a pool responsavel pelas sessoes no db
const options ={
    connectionLimit: 10,
    password: 'dumb123',
    user: "root",
    database: "temlogicaDB",
    host: "localhost",
    createDatabaseTable: true
    
}
const pool = mysql.createPool(options);
const sessionStore = new mysqlStore(options, pool);
router.use(express.urlencoded({extended:false}));
router.use(express.json());
router.use(session({
    name: "enter_the_void",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: "lighthouse",
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true,
        secure: false
    }
}))

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
     const contato = await db.insertContato(nome, email, texto);
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
        const partida = req.body;
        partida.browser = req.useragent.browser;
        partida.platform = req.useragent.platform;
        partida.geoIp = req.useragent.geoIp;
        partida.id_jogador = req.session.id_jogador;
        if(partida){
         console.log(partida);
         //EscreverJSON(partida);
         res.status(201);
     } else{
        res.sendStatus(404);
    }
 })
router.post('/',  async (req, res, next)=>{
     try{
         const nome = req.body.nome;
         const ano = req.body.ano;
               if (!nome || !ano) {
                 return res.sendStatus(400);
              }
         const user =  await db.insertJogador(nome, ano).then(insertId=>{return db.getJogador(insertId);});
         req.session.userId = user.id;
             return res.redirect('/selecao'); 
     } catch(e){    
         console.log(e);
         res.sendStatus(400);
     }
 });
router.post('/nome', async (req,res) => {
    try{
        const nome = req.body.nome;
        const ano = req.body.ano;
              if (!nome || !ano) {
                return res.sendStatus(400);
             }
            const id_jogador =  await db.insertJogador(nome, ano);
            req.session.id_jogador = id_jogador;
            console.log(req.session.id_jogador);
        return res.redirect('../selecao/index.html')
    } catch(e){    
        console.log(e);
        res.sendStatus(400);
    }
    
 })
router.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
 })

module.exports = router