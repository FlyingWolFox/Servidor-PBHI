


function formHandler(event){
    event.preventDefault();
}
 async function getLink() {
    const form = document.getElementById('crieAtividade-form');
    form.addEventListener('submit', formHandler);
    const response = await fetch("/professores/getLink", {method:'post', body: new FormData(form)});
    const botao = document.getElementById('botao-resultado');
    const responseBox = document.getElementById('boxResposta');

    if (response.status == 201){
        responseBox.style.display = "none";
        responseBox.classList.remove("errorMsg");
        responseBox.classList.add("infoMsg");
        responseBox.innerHTML = "Link foi copiado"
        responseBox.style.display = "block";
        
        botao.innerHTML = await response.text()
        CopiaURL()
        botao.disabled = true;
        
    }else{
        responseBox.style.display = "none";
        responseBox.style.display = "block";
        responseBox.innerHTML = await response.text()
        responseBox.classList.remove("infoMsg");
        responseBox.classList.add("errorMsg");
    }
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

async function getListaFases(self){
    await fetch('/getJogos') 
    .then(res => res.json())
    .then(resultados => {
        for (const resultado of resultados) {
            if (self.value == resultado.nome_jogo){
                let selectInicio = document.getElementById('faseInicioAtividade')
                let selectFim = document.getElementById('faseFimAtividade')
                selectInicio.innerHTML = ''
                selectFim.innerHTML = ''
                for (let i = 1;i < resultado.max_fase;i++){
                    var opt = document.createElement("option");
                    opt.value= i;
                    opt.innerHTML = i; 
                    selectFim.appendChild(opt);
                    opt = document.createElement("option");
                    opt.value= i;
                    opt.innerHTML = i; 
                    selectInicio.appendChild(opt);
                }
            } 
        }
    })
}

window.onload = () => {
    getListaJogos();
    getListaFases({"value": 'COMPLETAR'});
}