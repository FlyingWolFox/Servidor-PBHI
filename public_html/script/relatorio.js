/* arquivo de modelo para criação dos relatórios*/
const divResultadoPartida = document.getElementById("tabela-resultado") 
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

const urlsTabelas = ["/getAllPartidas", ""]; // urls que retornam tabelas

 async function getTabela(urlTabela){
    await fetch(urlTabela) 
    .then(res => res.json())
    .then(resultados => {
        criaResultadoTable() 
        // o for a seguir itera entre o array de resultados do banco, que já está ordenado e dá append no table body da tabela
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

const urlsMetricas = ["/getTempoMedio", "/getPartidasVencidas","/getNumeroDeJogadores"]; // urls da api 


function setMetricas(resultado1, resultado2, resultado3){
    var tempoMedio = document.getElementById('tempo-medio-span');
    var acertos = document.getElementById('acertos-span');
    var numeroJogadores = document.getElementById('jogadores-span');
    tempoMedio.innerText = resultado1;
    acertos.innerText = resultado2;
    numeroJogadores.innerText = resultado3;

}
async function getMetricas(urlsMetricas){ // essa função funciona como wrapper pra todas as chamadas de metricas da api, 
//ela recebe um array de urls que pode ser alterado a qualquer momento,
      const [resultado1, resultado2, resultado3] = await Promise.all(
        urlsMetricas.map((urlsMetricas) => fetch(urlsMetricas).then((res) => res.json()))
     );
        console.log(resultado1[0].tempoMedio);
     setMetricas(resultado1[0].tempoMedio, resultado2[0].partidasVencidas, resultado3[0].numeroJogadores);
}

getMetricas(urlsMetricas);
getTabela(urlsTabelas[0]);

/* a unica div que precisa ter o texto ao lado é a de não finalizados: exemplo de par:{resultado[0].nome, resultado[0].NRespondidas}, {resultado[1].nome, resultado[1].Tentativas} 
    as urls que serão usadas [/getTentativas], [/getNaoFinalizados], [/getTempoExpirado],[/getMelhoresJogadores], [/getTaxaAcerto] 
*/
