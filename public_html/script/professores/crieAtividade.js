


function formHandler(event){
    event.preventDefault();
}
 async function getLink() {
    const form = document.getElementById('crieAtividade-form');
    form.addEventListener('submit', formHandler);
    const response = await fetch("/professores/getLink", {method:'post', body: new FormData(form)});
    var botao = document.getElementById('botao-resultado');
    botao.innerHTML = await response.text()
    console.log(botao.innerHTML)
    CopiaURL()
    botao.disabled = true;
  }

 
function CopiaURL(){
    var botao = document.getElementById('botao-resultado');
    const URL = botao.innerText.toLowerCase();
    navigator.clipboard.writeText(URL);
}
function appendJogo(resultado){
        var newSelect = document.getElementById('jogos');
        var opt = document.createElement("option");
        opt.value= resultado.nome_jogo;
        opt.innerHTML = resultado.nome_jogo; 
        newSelect.appendChild(opt);
}

async function getListaJogos(){
    await fetch('/getJogos') 
    .then(res => res.json())
    .then(resultados => {
        for (const resultado of resultados) {
            appendJogo(resultado) 
        }
    })
}

getListaJogos();