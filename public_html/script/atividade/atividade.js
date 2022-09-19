window.addEventListener('load', async (event) => {
    let dados_atividade = await fetch("/atividade/getSessionAtividade")
});

async function conferirAluno(){
    await fetch("/atividade/formAtividade.html")
}