const express = require('express')
const router = express.Router()
const comando = require('./comando')


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
router.post('/selecao/jogos', (req,res)=>{
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
router.post('/nome', (req,res) => {
    comando.createTableAlunos()
    comando.addAluno(req.body.nome,req.body.ano)
    res.redirect('../selecao/index.html')
 })
router.all('*', (req,res)=>{ 
     res.status(404).send('<h1>recurso não encontrado</h1');
 })

module.exports = router