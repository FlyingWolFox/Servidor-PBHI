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

function criarModalLogin(ano){ //Criando modal de login
  const body = document.querySelector('body')
  let fundo = document.createElement('form')
  fundo.setAttribute('id','modal-login')

  let backgroundLogin = document.createElement('div')
  backgroundLogin.setAttribute('id','background-modal-login')

  let firstName = document.createElement('input')
  firstName.setAttribute('type','text')
  firstName.setAttribute('placeholder','Nome Completo')
  firstName.setAttribute('id','firstName-modal-login')
  firstName.setAttribute('autocomplete','off')
  firstName.setAttribute('name','nome')
  firstName.setAttribute('id','firstName-modal-login')
  firstName.classList.add('modal-login-text')
  
  let anoAtual = document.createElement('input')
  anoAtual.setAttribute('type','text')
  anoAtual.setAttribute('name','ano')
  anoAtual.setAttribute('id','anoAtual-modal-login')
  anoAtual.setAttribute('value',ano)

  let buttonLogin = document.createElement('input')
  buttonLogin.setAttribute('type','button')
  buttonLogin.setAttribute('value','Continuar')
  // buttonLogin.setAttribute('type','submit')
  buttonLogin.setAttribute('id','botao-modal-login')
  buttonLogin.addEventListener('click', post)

  backgroundLogin.appendChild(firstName)
  backgroundLogin.appendChild(anoAtual)
  backgroundLogin.appendChild(buttonLogin)
  fundo.appendChild(backgroundLogin)
  body.appendChild(fundo)
}

async function trocarPagIndex(ano){
  let resultado = await (await fetch('/getstatus'))
  resultado = await resultado.text();
  resultado.logado ? window.location.href = './selecao/index.html': criarModalLogin(ano);
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
