window.addEventListener('load', async (event) => {
    const dados_atividade = (await (await fetch("/atividade/getSessionAtividade", {method:"post"})).json())[0]
    const nome_professor = document.getElementById("nome_professor")
    const data_encerramento = document.getElementById("data_encerramento")
    const escola = document.getElementById("escola")
    const turma = document.getElementById("turma")
    const comentario = document.getElementById("comentario")

    nome_professor.innerHTML = dados_atividade["professor_nome"]
    data_encerramento.innerHTML = dados_atividade["datah_expiracao"]
    escola.innerHTML = dados_atividade["escola"]
    turma.innerHTML = dados_atividade["turma"]
    comentario.innerHTML = dados_atividade["comentario"]
});

async function conferirAluno(){
    const atividade = await fetch("/atividade/formAtividade.html")
    res.json(atividade)
}