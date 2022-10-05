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

try {
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
} catch (error) {}

//Implementando modal de login

var logado = false;
function setEventoBotão(){
  buttonLogin = document.getElementById('botao-modal-login')
  buttonLogin.removeEventListener('click', trocarPagIndex);
  buttonLogin.addEventListener('click', salvaNome);
}
function criarModalLogin(nome){ //Criando modal de login
  const body = document.querySelector('body')
  let fundo = document.createElement('form')
  fundo.setAttribute('id','modal-login')
  let backgroundLogin = document.createElement('div')
  backgroundLogin.setAttribute('id','background-modal-login')
  let firstName = document.createElement('input')
  let buttonLogin = document.createElement('input')
  firstName.setAttribute('type','text')
  firstName.setAttribute('minlength','8')
  firstName.setAttribute('maxlength','30')
  firstName.setAttribute('size','15')
  buttonLogin.setAttribute('type','button')
  buttonLogin.setAttribute('value','Continuar')
  buttonLogin.setAttribute('id','botao-modal-login')
  firstName.setAttribute('id','firstName-modal-login')
  firstName.setAttribute('autocomplete','off')
  firstName.setAttribute('method','post')
  firstName.setAttribute('target','./selecao/index.html')
  firstName.setAttribute('action','../index.js')
  firstName.classList.add('modal-login-text')
  if(nome){
    firstName.setAttribute('placeholder',`Insira seu nome ou continue como ${nome}`)
    buttonLogin.addEventListener('click', trocarPagIndex)
    firstName.addEventListener('input', setEventoBotão)
  }else{
    firstName.setAttribute('placeholder','Nome Completo')
    buttonLogin.addEventListener('click', salvaNome)
  }
  backgroundLogin.appendChild(firstName)
  backgroundLogin.appendChild(buttonLogin)
  fundo.appendChild(backgroundLogin)
  body.appendChild(fundo)
}
 
function trocarPagIndex(){
   window.location.href = 'selecao/index.html';
}
var nome = localStorage.getItem('nome');
criarModalLogin(nome);

//
function salvaNome(){
  let nome = document.getElementById('firstName-modal-login').value
  if(nome.length > 0){
    document.getElementById('modal-login').style.display = 'none';
    localStorage.setItem('nome',nome)
  }
  logado = true;
}
