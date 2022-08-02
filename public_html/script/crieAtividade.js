

async function gerarLink(){
    var botao = document.getElementById('botao-resultado');
    botao.innerHTML = await getUUID();
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
        // o for a seguir itera entre o array de resultados do banco, que já está ordenado e dá append no table body da tabela
        for (const resultado of resultados) {
            appendJogo(resultado) 
        }
    })
}

async function getUUID(){
    const form = document.getElementById('crieAtividade-form');
    const formData = new FormData(form);
    const values = [...formData.entries()];
    console.log(values);
    try{
        
        let response = await fetch('/getLink', {
        method: 'POST',
        body: values,
        });
        return response.text()
    }catch(error){
        console.log(error);
    }
}

getListaJogos();