/* arquivo de modelo para criação dos relatórios*/
const divResultadoPartida = document.getElementById("tabela-resultado")
var testeObj1 =  {"nome":"Euuu","nome_jogo":"FLUXOGRAMA","faseAtual":1,"sucesso":0,"tempo_partida":Math.floor(Math.random() * 60) + 40}
var testeObj = {"nome":"Euuu","nome_jogo":"FLUXOGRAMA","faseAtual":1,"sucesso":1,"tempo_partida":Math.floor(Math.random() * 60) + 40} //objeto de teste
const id_atividade = localStorage.getItem('atividadeid');
const atividade = {
    id_atividade:id_atividade
    }


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
    fase.innerText = resultado.fase_atual
    let duracao = document.createElement('td')
    duracao.innerText = resultado.tempo_partida;
    let sucesso = document.createElement('td')
    sucesso.innerText = resultado.sucesso
    resultadoTableBodyRow.append(nomeJogador, nomeJogo, fase, duracao, sucesso) // insere as colunas no elemento tablerow
    resultadoTable.append(resultadoTableBodyRow) // insere a linha atual no elemento tabela
}

const urlTabela = ["/professores/getPartidasDaAtividade"]; // urls que retornam tabelas

 async function getTabela(urlTabela){
    await fetch(urlTabela,{method:"POST", headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }, body:JSON.stringify(atividade)}).then(res => res.json())
    .then(resultados => {
        criaResultadoTable() 
        // o for a seguir itera entre o array de resultados do banco, que já está ordenado e dá append no table body da tabela
        for (const resultado of resultados) {  
            console.log(resultado)
            appendResultado(resultado) // Creates and appends each row to the table body
        }
    })
}
function getResultadoTeste(){// funcao pra gerar a tabela usando o objeto de teste
    criaResultadoTable()
    for(let i = 1; i <=3; i++){
        if(i == 3){
            testeObj1.faseAtual = i;
           appendResultado(testeObj1) 
        }
        testeObj.faseAtual = i;
        appendResultado(testeObj)
        
        
    }
}

const urlsMetricas = ["/professores/getTempoMedio", "/professores/getPartidasVencidas","/professores/getNumeroDeJogadores", "/professores/getTaxaAcerto"]; // urls da api 
const urlsPontuacao = ["/professores/getNaoFinalizados", "/professores/getTentativas"]; // urls da api 
const urlDadosAtividade = ["/professores/getDadosAtividade"]; // urls da api

function setMetricas(resultado1, resultado2, resultado3, resultado4){
    var tempoMedio = document.getElementById('tempo-medio-span');
    var acertos = document.getElementById('acertos-span');
    var numeroJogadores = document.getElementById('jogadores-span');
    var taxaAcerto = document.getElementById('taxa-acerto');
    taxaAcerto.innerHTML = resultado4 + '%';
    tempoMedio.innerText = resultado1;
    acertos.innerText = resultado2;
    numeroJogadores.innerText = resultado3;

}
async function getMetricas(urlsMetricas){ // essa função funciona como wrapper pra todas as chamadas de metricas da api, 
    //ela recebe um array de urls que pode ser alterado a qualquer momento,
   
          const [resultado1, resultado2, resultado3, resultado4] = await Promise.all(
            urlsMetricas.map((urlsMetricas) => fetch(urlsMetricas,{method:"POST", headers : { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
               }, body:JSON.stringify(atividade)}).then((res) => res.json()))
         );
         setMetricas(resultado1[0].tempoMedio, resultado2[0].partidasVencidas, resultado3[0].numeroJogadores, resultado4[0].taxaAcerto);
    }

async function getPontuacao(urlsPontuacao){ //nFinalizados, nTentativas sao arrays de objetos do banco que contem o numero de tentativas e o numero de jogadores que nao finalizaram a atividade
    const [naoFinalizados, nTentativas] = await Promise.all(
        urlsPontuacao.map((urlsPontuacao) => fetch(urlsPontuacao, {method:"POST", headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           }, body:JSON.stringify(atividade)}).then((res) => res.json()))
    );
        setPontuacao(naoFinalizados, nTentativas);
}
async function getDadosAtividade(urlDadosAtividade){
    await fetch(urlDadosAtividade,{method:"POST", headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }, body:JSON.stringify(atividade)}).then(res => res.json())
    .then(resultado => {
        setDadosAtividade(resultado)
    })
}
function setDadosAtividade(resultado){
    const datah_criacao = document.getElementById('datah-criacao');
    const datah_encerramento = document.getElementById('datah-encerramento');
    const professor_nome = document.getElementById('nome-professor');
    datah_criacao.innerText = resultado[0].datah_criacao.replace('T', ' ').replace('Z', '');
    datah_encerramento.innerText = resultado[0].datah_expiracao.replace('T', ' ').replace('Z', '');
    professor_nome.innerText = resultado[0].professor_nome;
}    

function construirDivNãoFinalizados(resultados) { 
    const section = document.getElementById('nao-finalizados');
    if(eVazio(resultados)){
        while (section.firstChild){
            section.removeChild(section.firstChild) // remove o resultado anterior se houver
         } 
        return;
    }
    console.log('dentro de construir divs')
    
    while (section.firstChild){
       section.removeChild(section.firstChild) // remove o resultado anterior se houver
    } 
    for(const resultado of resultados){ 
            console.log('dentro do for each')
            const div = document.createElement('div');
            const p = document.createElement('p');
            p.id = "nome-aluno";
            p.innerHTML = resultado.nome;
            const strong = document.createElement('strong');
            strong.id = "numero-sem-resposta";
            if(resultado.NRespondidas == 1){
                strong.innerHTML = resultado.NRespondidas + ' sem resposta';
            }else{
                strong.innerHTML = resultado.NRespondidas + ' sem respostas';
            }
            div.appendChild(p);
            div.appendChild(strong);
            section.appendChild(div);
    }
  }

  
function construirDivTentativas(resultados) { 
    const section = document.getElementById('tentativas');
    if(eVazio(resultados)){
        while (section.firstChild){
            section.removeChild(section.firstChild) // remove o resultado anterior se houver
         } 
        return;
    }
    while (section.firstChild){
        section.removeChild(section.firstChild) // remove o resultado anterior se houver
    } 
    for(const resultado of resultados){ 
            console.log('dentro do for each')
            const div = document.createElement('div');
            const p = document.createElement('p');
            p.id = "nome-aluno";
            p.innerHTML = resultado.nome;
            const strong = document.createElement('strong');
            strong.id = "numero-tentativas";
            strong.innerHTML = resultado.Tentativas + ' tentativas';
            div.appendChild(p);
            div.appendChild(strong);
            section.appendChild(div);
    }
  }

function eVazio(obj) {
    return Object.keys(obj).length === 0;
}
function setPontuacao(naoFinalizados, nTentativas){
    console.log('setPontuacao')
    var tentativasSpan = document.getElementById('numero-ajuda');
    var naofinalizadosSpan = document.getElementById('numero-nao-finalizados');
    if(eVazio(nTentativas) || eVazio(naoFinalizados)){
            if (eVazio(nTentativas) && eVazio(naoFinalizados)) {
                console.log('case 0')
                tentativasSpan.innerHTML = 0;
                naofinalizadosSpan.innerHTML = 0;
                return 0;
            }
            else if (eVazio(naoFinalizados)) {
                console.log('case 1')
                naofinalizadosSpan.innerHTML = 0;
                tentativasSpan.innerHTML = nTentativas[0].NumeroJogadores;
                construirDivTentativas(nTentativas);
                construirDivNãoFinalizados(0);
                return 0;
            } else if (eVazio(nTentativas)) {
                console.log('Case 2')
                console.log(naoFinalizados);
                tentativasSpan.innerHTML = 0;
                naofinalizadosSpan.innerHTML = naoFinalizados[0].NumeroJogadores;
                construirDivNãoFinalizados(naoFinalizados);
                construirDivTentativas(0);
                return 0;
            }
    }else{
            console.log('Case default')
            naofinalizadosSpan.innerHTML = naoFinalizados[0].NumeroJogadores;
            tentativasSpan.innerHTML = nTentativas[0].NumeroJogadores;
            construirDivNãoFinalizados(naoFinalizados);
            construirDivTentativas(nTentativas);
            return 0;
    }
}

getMetricas(urlsMetricas);
getTabela(urlTabela);
getPontuacao(urlsPontuacao);
getDadosAtividade(urlDadosAtividade);
