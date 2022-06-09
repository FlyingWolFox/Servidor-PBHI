//requisições do express
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser')
const logger = require('./logger.js');
const useragent = require('express-useragent');
const router = require('./rotas');
const mysqlStore = require('express-mysql-session')(session);
const connection = require('mysql2/promise')
// const fs = require('fs');
// const geoip = require('geoip-lite');
const TWO_HOURS = 1000 * 60 * 60 * 2

var option = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'temlogicaDB',
    waitForConnections: true,
    connectionLimit: 10
}

var mysql = connection.createPool(option)
var sessionStore = new mysqlStore(option, mysql);

//criando o acesso de arquivos estáticos e disparando o logger
app.use('/selecao/jogos', logger);
app.use(express.static('./public_html'));
app.use(useragent.express());

//parser de url para o formulario, parser do body para as partidas
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//funcoes de sessao
app.use(session({
    name: "session_id",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    secret: "sioajffen",
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: 'strict',
        secure: false
    }
}))

// requisicoes do servidor
app.set('trust proxy', true);
app.use(router);

app.listen(process.env.PORT || 3000, () => console.log('App disponivel na http://localhost:3000'));
