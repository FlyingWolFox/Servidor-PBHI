
// objeto com os dados da partida, a ser modificado caso seja necessario
const partida = {
  nomeJogo : '',
  faseAtual : 0,
  tempoDeJogo:'',
  sucesso:false,
  data_hora: '',
};

// Ajustes do modal ------------


var modalAcerto = document.getElementById("modalAcerto");
var modalErro = document.getElementById('modalErro');

var botaoRecomecar = document.getElementById('botao-retorno');

function fecharModal(tipo) {
  
  tipo == 'acerto'? modalAcerto.style.display= 'none': modalErro.style.display= 'none'

}


window.onclick = function (event) {
  if (event.target == modalAcerto || event.target == modalErro) {
    // modalErro.style.display = "none";
    // modalAcerto.style.display= 'none';
    modalErro.style.display = false;
    modalAcerto.style.display= false;
  }
}
// Ajustes do fullscreen ------------ 

var fullscreenButton = document.getElementById('span-fullscreen');
var gameHeader = document.getElementsByTagName('header')[0];
var gameFooter = document.getElementsByTagName('footer')[0];
var indexHead = document.getElementsByTagName('head')[0];
var fullscreen = false;

var gameContainer = document.getElementById('main-body');

gameContainer.addEventListener('fullscreenchange', (e) => {

  if (document.fullscreenElement) {

    // gameHeader.style.display = 'none';
    // gameFooter.style.display = 'none';
    fullscreenButton.innerText = "🗕"

    // Criando o CSS responsável pelo modo Fullscreen
    var fullscreenCss = document.createElement('link');
    fullscreenCss.setAttribute('href', '../style/fullscreen-mode.css');
    fullscreenCss.setAttribute('rel', 'stylesheet');
    indexHead.appendChild(fullscreenCss);

  } else {

    // gameHeader.style.display = 'grid';
    // gameFooter.style.display = 'grid';
    fullscreenButton.innerHTML = "<i class='icofont-maximize'></i>"
    indexHead.removeChild(indexHead.lastChild);

  }

})

fullscreenButton.onclick = () => {

  if (!document.fullscreenElement) {

    gameContainer.requestFullscreen();

  } else {

    document.exitFullscreen()

  }

};
// funcao post usando fetch e baseada em promessas
async function postPartida(url = '', data = {}) {
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
  var nomeJogo  = document.getElementById('title-jogo').getAttribute('nome-real');
  
  partida.nomeJogo = nomeJogo;
  console.log('a pagina carregou completamente e voce esta jogando: ' + partida.nomeJogo);
  window.addEventListener('focus', focus);
  window.addEventListener('blur', blur);
}
function stopPartida(){
  partida.data_hora = new Date().toISOString().slice(0, 19).replace('T', ' ');

  partida.faseAtual = parseInt(document.getElementById('textbox-numero-fase').innerHTML);
  console.log('essa eh uma instancia de fase gerada pelo botao terminei e essa eh a fase numero' + partida.faseAtual);
  beforeunload();
}
function setResultado(){
  partida.sucesso = true;
  postPartida('/partida', partida);
}
function setResultadoErrou(){
  partida.sucesso = false;
  postPartida('/partida', partida);
}
let startDate = new Date();
let elapsedTime = 0;

const focus = function() { //mede os intervalos que o usuario passou com a pagina em focus
    startDate = new Date();
};

const blur = function() { //mede os intervalos que o usuario passou com a pagina em blur
    const endDate = new Date();
    const spentTime = endDate.getTime() - startDate.getTime();
    elapsedTime += spentTime;
};

const beforeunload = function() { //para a contagem de intervalos e faz o somatorio
    const endDate = new Date();
    const spentTime = endDate.getTime() - startDate.getTime();
    elapsedTime += spentTime;
    console.log('o tempo que vc passou na pagina foi:'+ (elapsedTime/1000) + 'segundos');  // elapsedTime contains the time spent on page in milliseconds
    partida.tempoDeJogo = (elapsedTime/1000);
    window.removeEventListener('focus', focus); //reseta o contador e reinicia para o proximo jogo
    window.removeEventListener('blur', blur);
    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);
    startDate = new Date();
    elapsedTime = 0;
};



//lidando com as instancias de fase 

window.addEventListener('load', startPartida);
var botaoCorrigir = document.getElementById('botao-resultado');
botaoCorrigir.addEventListener('click', stopPartida);
botaoResultado = document.getElementById('botao-proximo');
botaoRestart = document.getElementById('botao-restart');
botaoRestart.addEventListener('click', setResultado);
botaoResultado.addEventListener('click',setResultado);
botaoRetorno = document.getElementById('botao-retorno');
botaoRetorno.addEventListener('click', setResultadoErrou);
