//requisições do express
require('dotenv').config()
const express = require('express');
const app = express();
const multer = require('multer');
const formParser = multer();
const session = require('express-session');
const logger = require('./logger.js');
const routerDefault = require('./rotas/rotas');
const mysqlStore = require('express-mysql-session')(session);
const connection = require('mysql2/promise');
const routerAtividade = require('./rotas/rotasAtividade.js');
const routerProfessores = require('./rotas/rotasProfessores.js');
// const fs = require('fs');
// const geoip = require('geoip-lite');
const TWO_HOURS = 1000 * 60 * 60 * 2

var option = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    
}
optStore = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    createDatabaseTable: false,
	schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
};



var mysql = connection.createPool(option)
var sessionStore = new mysqlStore(optStore, mysql);
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

//criando o acesso de arquivos estáticos e disparando o logger
/*app.use(function(req, res, next) {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();    
  });*/
app.use('/selecao/jogos', logger);
app.use(express.static('./public_html'));


//parser de url para o formulario, parser do body para as partidas
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(formParser.array());


// requisicoes do servidor
app.set('trust proxy', true);
//app.disable('etag');
app.use('/professores', routerProfessores);
app.use('/atividade', routerAtividade);
app.use(routerDefault);



app.listen(process.env.PORT || 3000, () => console.log('App disponivel na http://localhost:3000'));
