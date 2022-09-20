window.addEventListener('load', async (event) => {
    const dados_atividade = await fetch("/atividade/getSessionAtividade")
    const nome_professor = document.getElementById("nome_professor")
    const data_encerramento = document.getElementById("data_encerramento")
    const escola = document.getElementById("escola")
    const turma = document.getElementById("turma")
    const comentario = document.getElementById("comentario")

    await fetch
});

async function conferirAluno(){
    await fetch("/atividade/formAtividade.html")
}