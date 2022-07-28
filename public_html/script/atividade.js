
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

async function getUUID(){
   const response = await fetch('/getLink')
    return response.text()
}
