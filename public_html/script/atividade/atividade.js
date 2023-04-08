window.addEventListener('load', async (event) => {
    const dados_atividade = (await (await fetch("/atividade/getSessionAtividade", {method:"post"})).json())[0]
    const nome_professor = document.getElementById("nome_professor")
    const data_encerramento = document.getElementById("data_encerramento")
    const data_criacao = document.getElementById("data_criacao")
    const escola = document.getElementById("escola")
    const turma = document.getElementById("turma")
    const comentario = document.getElementById("comentario")

    const data_fim = organizar_time(dados_atividade["datah_expiracao"])
    const data_inicio = organizar_time(dados_atividade["datah_criacao"])

    nome_professor.innerHTML = dados_atividade["professor_nome"]
    data_encerramento.innerHTML = data_fim
    data_criacao.innerHTML = data_inicio
    escola.innerHTML = dados_atividade["escola"]
    turma.innerHTML = dados_atividade["turma"]
    console.log(dados_atividade["comentario"])
    if (dados_atividade["comentario"]){
        comentario.innerHTML = dados_atividade["comentario"]
    }else{
        comentario.parentNode.remove()
    }
});

async function conferirAluno(){
    const atividade = await fetch("/atividade/formAtividade.html")
    res.json(atividade)
}

function organizar_time(tempo){
    const date = new Date(tempo)
    date.setHours(date.getHours()-3)
    return `${("00" + date.getDate()).slice(-2)}/${("00" + date.getMonth()).slice(-2)}  ${date.getHours()}:${date.getMinutes()}`
}