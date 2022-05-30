// objeto com os dados da partida, a ser modificado caso seja necessario
const partida = {
    nomeJogo : '',
    faseAtual : 0,
    tempoDeJogo:'',
    sucesso:false
  };
function setPartida(){
  
}

  // funcao post usando fetch e baseada em promessa
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    
    return response.text(); // parses JSON response into native JavaScript objects
  }
  //funcoes trigger da partida
  function startPartida(){
    partida.nomeJogo = document.getElementById('title-jogo').innerHTML;
    console.log('a pagina carregou completamente e voce esta jogando: ' + partida.nomeJogo);
  }
  function stopPartida(){
    partida.faseAtual = parseInt(document.getElementById('textbox-numero-fase').innerHTML);
    console.log('essa eh uma instancia de fase gerada pelo botao terminei e essa eh a fase numero' + partida.faseAtual);
    postData('/selecao/jogos', partida);
  }
  
  
  //lidando com as instancias de fase 
  
  window.addEventListener('load', startPartida);
  var botaoCorrigir = document.getElementById('botao-resultado');
  botaoCorrigir.addEventListener('click', stopPartida);