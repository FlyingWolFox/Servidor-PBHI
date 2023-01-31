function formHandler(event){
    event.preventDefault();
}
 async function selecionarRelatorio(){
    const form = document.getElementById('escolheAtividade-form');
    form.addEventListener('submit', formHandler);
    const formData = new FormData(form);
    const selected  = formData.getAll('atividade');
    const atividadeid = selected;
    const storage = window.localStorage;
    storage.setItem("atividadeid", atividadeid);
    window.location.href = '../professores/relatorioantigo.html'
  }

function appendSelect(resultado){
    var newSelect = document.getElementById('atividades');
    var opt = document.createElement("option");
    opt.value= resultado.id_atividade;
    opt.innerHTML = resultado.id_atividade; 
    newSelect.appendChild(opt);
}

async function getListaAtividades(){
    console.log('Passei por getLista')
await fetch('/professores/getAtividades') 
.then(res => res.json())
.then(resultados => {
    for (const resultado of resultados) {
        appendSelect(resultado) 
    }
})
}

getListaAtividades();