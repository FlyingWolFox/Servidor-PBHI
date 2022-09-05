/* arquivo de modelo para criação dos relatórios*/
const divResultadoPartida = document.querySelector("div.resultado-partida") 
const testeObj = {"nome":"Ana Beatriz","nome_jogo":"COMPLETAR","faseAtual":1,"sucesso":1,"tempo_partida":2} //objeto de teste



let tableHeaders = ["Nome", "Jogo", "Fase", "Duração [Segundos]", "Sucesso[S/N]"]

function criaResultadoTable(){
    
    while (divResultadoPartida.firstChild){
        divResultadoPartida.removeChild(divResultadoPartida.firstChild) // remove o resultado anterior se houver
    } 
    // O bloco a seguir cria a tabela, os headers e as colunas correspondentes a cada header
    let resultadoTable = document.createElement('table') 
    resultadoTable.className = 'resultadoTable'
    let resultadoTableHead = document.createElement('thead') 
    resultadoTableHead.className = 'resultadoTableHead'
    let resultadoTableHeaderRow = document.createElement('tr') 
    resultadoTableHeaderRow.className = 'resultadoTableHeaderRow'
    // o bloco for vai iterar entre todos os headers e criar um elemento 'th' e dar append nele com o seu conteúdo para o elemento header
    tableHeaders.forEach(header => {
        let resultadoHeader = document.createElement('th') 
        resultadoHeader.innerText = header
        resultadoTableHeaderRow.append(resultadoHeader) 
    })
    resultadoTableHead.append(resultadoTableHeaderRow) 
    resultadoTable.append(resultadoTableHead)
    //o bloco a seguir cria o elemento table body e da append nele dentro do elemento table, em seguida da append no table para a div
    let resultadoTableBody = document.createElement('tbody') // 
    resultadoTableBody.className = "resultadoTable-Body"
    resultadoTable.append(resultadoTableBody) 
    divResultadoPartida.append(resultadoTable) 
}
// essa função recebe um valor único de resultado e opcionalmente recebe um indice(caso queira fazer um ranking) e preenche a tabela baseado no conteúdo de cada linha
function appendResultado(resultado, resultadoIndex){
const resultadoTable = document.querySelector('.resultadoTable') 
let resultadoTableBodyRow = document.createElement('tr') // cria a linha atual da tabela
resultadoTableBodyRow.className = 'resultadoTableBodyRow'
//o bloco a seguir cria as 5 colunas que vão ser inseridas na linha atual da tabela
//let index = document.createElement('td')
//index.innerHTML = partidaIndex
let nomeJogador = document.createElement('td')
nomeJogador.innerText = resultado.nome;
let nomeJogo = document.createElement('td')
nomeJogo.innerText = resultado.nome_jogo;
let fase = document.createElement('td')
fase.innerText = resultado.faseAtual
let duracao = document.createElement('td')
duracao.innerText = resultado.tempo_partida;
let sucesso = document.createElement('td')
sucesso.innerText = resultado.sucesso
resultadoTableBodyRow.append(nomeJogador, nomeJogo, fase, duracao, sucesso) // insere as colunas no elemento tablerow
resultadoTable.append(resultadoTableBodyRow) // insere a linha atual no elemento tabela
}
function getResultado(){
    fetch('http://localhost:3000/getAllPartidas') 
    .then(res => res.json())
    .then(resultados => {
        criaResultadoTable() 
        // o for a seguir itera entre o array de resultados do banco, que já estão ordenados e dá append no table body da tabela
        for (const resultado of resultados) {
            let resultadoIndex = resultados.indexOf(resultado)  // indice do resultado no array de resultado
            appendResultado(resultado, resultadoIndex) // Creates and appends each row to the table body
        }
    })
}
function getResultadoTeste(){// funcao pra gerar a tabela usando o objeto de teste
    criaResultadoTable()
    for(let i = 0; i < 400; i++){

        appendResultado(testeObj);
    }
}
getResultadoTeste();