//requisições do express
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const logger = require('./logger.js');
const useragent = require('express-useragent');
const mysql = require('mysql');
const { rootCertificates } = require('tls');

 
app.use(useragent.express());

//criando o acesso de arquivos estáticos e disparando o logger
app.use('/selecao/jogos', logger);
app.use(express.static('./public_html'));
app.use(useragent.express());
//parser de url para o formulario, parser do body para as partidas
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//funcoes de apoio
function EscreverJSON(aluno){
    var dadosJson = aluno;
    var conteudoJson = JSON.stringify(dadosJson,null, 2 );
    fs.appendFile("testes.json", conteudoJson, 'utf-8', function(err){
        if(err){
            console.log("ocorreu um erro escrevendo um objeto json no arquivo");
        }
    console.log('o arquivo json foi salvo.')    
    })
}

/*funcoes database
const db = mysql.createConnection({
    user: "root",
    host:"localhost",
    password:"dumb123",
    database:"temlogicaDB",

});
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });


  const insert = (data = {})=>{
    var sql = "INSERT INTO contato(nome, email, comentario) VALUES ?";
    var values = data;
    db.query(sql, values, function(err, result){
        if(err) throw err;
        console.log("numero de registros inseridos:" + result.affectedRows);
    });
}
*/
// requisicoes do servidor


app.set('trust proxy', true);

app.post('/contato.html', (req, res)=>{
    Alunos = new Object();
    Alunos.nome = req.body.nome;
    Alunos.email = req.body.email;
    Alunos.texto = req.body.texto;
    Alunos.browser = req.useragent.browser;
    Alunos.platform = req.useragent.platform;
    Alunos.geoIp = req.useragent.geoIp;
    Alunos.isMobile = req.useragent.isMobile;
    
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(ip);


    if(Alunos.nome){
        //JSON.stringify(Alunos);
        //insert(Alunos);
        EscreverJSON(Alunos);
      return res.status(201).send('sucesso salvando seu nome: ' + Alunos.nome);
    }
    res.status(401).send('por favor informe seu nome');
    
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
app.all('*', (req,res)=>{ 
    res.status(404).send('<h1>recurso não encontrado</h1');
})
app.listen(process.env.PORT || 3000, () => console.log('app disponivel na http://localhost:3000'));
