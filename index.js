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
const rotas = require('./rotas')

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
app.use(rotas);

app.listen(process.env.PORT || 3000, () => console.log('App disponivel na http://localhost:3000'));
