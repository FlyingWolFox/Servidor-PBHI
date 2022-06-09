const express = require('express');
const router = express.Router()
const sql = require("./sql.js");
const sessao = require('./session');
const { addJogos, obterJogos } = require('./sql.js');
const TWO_HOURS = 1000 * 60 * 60 * 2

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
     const contato = await sql.insertContato(nome, email, texto);
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
         console.log(req.body);
         //EscreverJSON(partida);
         res.status(201);
     } else{
        res.sendStatus(404);
    }
})

router.post('/nome', async (req,res) => {
    req.session.regenerate((e) => {})
    const nome = req.body.nome;
    const ano = req.body.ano;
    
    if (!nome || !ano) {
        return res.sendStatus(400);
     }
     var auxIdJogador = await sql.getJogadorByNomeAno(nome, ano);
     console.log(auxIdJogador);
     if(!auxIdJogador){
     const id_jogador =  await sql.insertJogador(nome, ano);
     req.session.id_jogador = id_jogador;
     req.session.nome = nome;
     req.session.ano = ano;
     console.log(req.session.id_jogador);
     return res.redirect('../selecao/index.html') 
     }
    
    const id_jogador = auxIdJogador.id_jogador;
    req.session.id_jogador = id_jogador;
    req.session.nome = nome;
    req.session.ano = ano;
    console.log(req.session.id_jogador);
    return res.redirect('../selecao/index.html') 
})
router.get('/addjogos', async (req,res) => {
    sql.createTableJogos()
    let jogos = await sql.obterJogos()
    if(jogos == '') sql.addJogos();
    else console.log("Jogos já foram adicionados");
})
router.get('/getsession',(req,res) => {
    res.send(sessao.getSession(req))
})
router.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
})

module.exports = router