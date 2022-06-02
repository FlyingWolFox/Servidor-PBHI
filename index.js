//requisições do express
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser')
const fs = require('fs');
const logger = require('./logger.js');
const useragent = require('express-useragent');
const mysql = require('mysql');
const geoip = require('geoip-lite');
const db = require("./db.js");
const mysqlStore = require('express-mysql-session')(session);


//criando a pool responsavel pelas sessoes no db
const TWO_HOURS = 1000 * 60 * 60 * 2
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




//criando o acesso de arquivos estáticos e disparando o logger
app.use('/selecao/jogos', logger);
app.use(express.static('./public_html'));
app.use(useragent.express());
//parser de url para o formulario, parser do body para as partidas
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//funcoes de apoio
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

//funcoes de sessao
app.use(session({
    name: "enter_the_void",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: "lighthouse",
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true,
        secure: "development"
    }
}))



// requisicoes do servidor
app.set('trust proxy', true);

app.post('/contato.html', async (req, res)=>{
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
app.post('/selecao/jogos', (req,res)=>{
  const partida = req.body;
    partida.browser = req.useragent.browser;
    partida.platform = req.useragent.platform;
    partida.geoIp = req.useragent.geoIp;
    if(partida){
        console.log(partida);
        EscreverJSON(partida);
        return res.status(201).send(req.body);
    }
    res.status(401).send('houve um erro recebendo a partida');
})
app.post('/',  async (req, res, next)=>{
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
app.post('/nome', (req,res) => {
    res.send(req.body.nome+'<br>'+req.body.ano)
})

app.all('*', (req,res)=>{ 
    res.status(404).send('<h1>recurso não encontrado</h1');
})
app.listen(process.env.PORT || 3000, () => console.log('App disponivel na http://localhost:3000'));
