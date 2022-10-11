//Ajustes do modal
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

function setEventoBotão(){
  buttonLogin = document.getElementById('botao-modal-login')
  buttonLogin.removeEventListener('click', trocarPagIndex);
  buttonLogin.addEventListener('click', post);
}
function criarModalLogin(nome, anoAluno){ //Criando modal de login
  const body = document.querySelector('body')
  let fundo = document.createElement('form')
  fundo.setAttribute('id','modal-login')
  let backgroundLogin = document.createElement('div')
  backgroundLogin.setAttribute('id','background-modal-login')
  let anoAtual = document.createElement('input')
  anoAtual.setAttribute('type','text')
  anoAtual.setAttribute('name','ano')
  anoAtual.setAttribute('id','anoAtual-modal-login')
  anoAtual.setAttribute('value', anoAluno)
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
    buttonLogin.addEventListener('click', post)
  }
  backgroundLogin.appendChild(anoAtual);
  backgroundLogin.appendChild(firstName)
  backgroundLogin.appendChild(buttonLogin)
  fundo.appendChild(backgroundLogin)
  body.appendChild(fundo)
}
function trocarPagIndex(){
  window.location.href = 'selecao/index.html'
  
}
async function checkStatus(ano){
  var anoAluno = ano;
  if(!anoAluno){
    console.log('não recebi o ano')
  }
  let resultado = await (await fetch('/getStatus'))
  resultado = await resultado.json();
  criarModalLogin(resultado.nome, anoAluno);
}
async function post(){
  var modal = document.getElementById('modal-login')
  var Fnome = document.getElementById('firstName-modal-login').value 
  var Fano = document.getElementById('anoAtual-modal-login').value 
  var data = {
    nome: Fnome,
    ano: Fano
  }
  let resultado = await fetch('/nome', {
    method: "POST",
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     },
    body: JSON.stringify(data)
  })
  let error = await resultado.json();
  if(error){
    console.log(error)
  }
  else{
    window.location.href = './selecao/index.html';
  }
}