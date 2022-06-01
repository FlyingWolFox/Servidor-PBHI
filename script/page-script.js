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


function criarModalLogin(){ //Criando modal de login
  const body = document.querySelector('body')
  let fundo = document.createElement('form')
  fundo.setAttribute('id','modal-login')

  let backgroundLogin = document.createElement('div')
  backgroundLogin.setAttribute('id','background-modal-login')

  /*let labelName = document.createElement('div')
  labelName.setAttribute('id','labelNome-modal-login')
  labelName.classList.add('label-modal-login')
  let textLabel = document.createTextNode('Nome:')
  labelName.appendChild(textLabel)

  let labelName2 = document.createElement('div')
  labelName2.setAttribute('id','labelSobrenome-modal-login')
  labelName2.setAttribute('aria-hidden','true')
  labelName2.classList.add('label-modal-login')
  let textLabel2 = document.createTextNode('Sobrenome:')
  labelName2.appendChild(textLabel2)*/

  let firstName = document.createElement('input')
  firstName.setAttribute('type','text')
  firstName.setAttribute('minlength','8')
  firstName.setAttribute('maxlength','30')
  firstName.setAttribute('size','15')
  firstName.setAttribute('placeholder','Nome Completo')
  firstName.setAttribute('id','firstName-modal-login')
  firstName.setAttribute('autocomplete','off')
  firstName.setAttribute('method','post')
  firstName.setAttribute('action','#')
  firstName.classList.add('modal-login-text')

  // let lastName = document.createElement('input')
  // lastName.setAttribute('type','text')
  // lastName.setAttribute('minlength','4')
  // lastName.setAttribute('maxlength','12')
  // lastName.setAttribute('size','15')
  // lastName.setAttribute('placeholder','Sobrenome')
  // lastName.setAttribute('id','lastName-modal-login')
  // lastName.setAttribute('method','post')
  // lastName.setAttribute('action','#')
  // lastName.classList.add('modal-login-text')

  let buttonLogin = document.createElement('input')
  buttonLogin.setAttribute('type','button')
  buttonLogin.setAttribute('value','Continuar')
  buttonLogin.setAttribute('id','botao-modal-login')
  buttonLogin.addEventListener('click', salvaNome)

  /*backgroundLogin.appendChild(labelName)
  backgroundLogin.appendChild(labelName2)*/
  backgroundLogin.appendChild(firstName)
  // backgroundLogin.appendChild(lastName)
  backgroundLogin.appendChild(buttonLogin)
  fundo.appendChild(backgroundLogin)
  body.appendChild(fundo)
}

criarModalLogin()

function salvaNome(){
  let nome = document.getElementById('firstName-modal-login').value
  let sobrenome = document.getElementById('lastName-modal-login').value
  if(nome.length > 0 && sobrenome.length > 0){
    document.getElementById('modal-login').style.display = 'none';
    localStorage.setItem('nome',nome+' '+sobrenome)
  }
}
