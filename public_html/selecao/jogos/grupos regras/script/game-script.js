import { ACCEPTED, BOTH_SIDES, ONE_SIDE, REJECTED, TRAIT, TRAIT_EXTRA } from './game-structures.js';
import { gerarNivel, RestrictionSet, shuffleArray } from './game-algorithms.js';

const urlParam = new URLSearchParams(window.location.search)
console.log('Fase:'+ urlParam.get("fase"))
const faseInicial = urlParam.get("fase")
if (faseInicial == null){
	var etapaAtual = 0;
}
else{
	var etapaAtual = parseInt(faseInicial)-1
}
var estrela = 0;      //Contagem das estrelas (5 por etapa)
var endGame;

const textNumeroFase = 'textbox_numero_fase';

const divRestricaoEsquerdaId = 'container-restricao-esquerda';
const divRestricaoDireitaId = 'container-restricao-direita';

const divCaixaEsquerdaId = 'caixa-esquerda';
const divCaixaDireitaId = 'caixa-direita';
const divCaixaIntersecaoId = 'caixa-intersecao';

const divRespostasId = 'container_respostas';

const divEstrelas = 'conquistas_conteiner';
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');

var textoInfo = document.getElementById('resultado-jogo-info');
var modalInfo = document.getElementById("modalInfoPeca");
var botaoOk = document.getElementById('botao-proximo-info');
var etapaMax = 40;

async function getFasesPorAno(){
	var resposta = await fetch("/getAtividade")
	const atividade = await (resposta.json())
	console.log('Atividade: '+ JSON.stringify(atividade))	
	if (atividade) {
		etapaMax = atividade[0].fase_fim
    }
    console.log("esse eh o numero maximo de fases desse ano: " + etapaMax);
}
getFasesPorAno();

function removeChildElementsByTag(parent, tag) {
    if (parent != null) {
        var parentDom = document.getElementById(parent);
        var elements = parentDom.getElementsByTagName(tag);
        var i;
        console.log('parent ' + parentDom.getAttribute('id') + ' tem ' + elements.length + ' childs.');
        for (i = elements.length - 1; i >= 0; i--) {
            console.log('removendo ' + elements[i].getAttribute('id') + '/' + elements[i].parentNode.getAttribute('id'));
            //parentDom.removeChild(elements[i]);
            elements[i].remove();
        }
    }
}

function reset() {
    removeChildElementsByTag(divRespostasId, 'img');
    removeChildElementsByTag(divRestricaoEsquerdaId, 'img');
    removeChildElementsByTag(divRestricaoDireitaId, 'img');
    removeChildElementsByTag(divCaixaEsquerdaId, 'img');
    removeChildElementsByTag(divCaixaIntersecaoId, 'img');
    removeChildElementsByTag(divCaixaDireitaId, 'img');
}

function resetEstrelas() {
    estrela = 0;
    for (var i = 0; i < arrayEstrelas.length; i++) {
        arrayEstrelas[i].setAttribute('src', '../img/estrelas/star2.svg');
    }
    var texto = document.getElementById('texto1');
    texto.innerHTML = "?";
    texto = document.getElementById('texto2');
    texto.innerHTML = "?";
    texto = document.getElementById('texto3');
    texto.innerHTML = "?";
    texto = document.getElementById('texto4');
    texto.innerHTML = "?";
}

function chuva() {
    for (let i = 1; i < 50; i++) {
        let rand = Math.floor(Math.random() * document.body.clientWidth - 20);
        let cor = Math.floor(Math.random() * 4);
        let rotate = Math.floor(Math.random() * 360);
        switch (cor) {
            case 0:
                cor = '#fc21bf';
                break;
            case 1:
                cor = 'skyblue';
                break;
            case 2:
                cor = '#c400ff';
                break;
            case 3:
                cor = '#16fcab';
                break;
            case 4:
                cor = '#ff1616';
                break;
        }
        var confete = document.createElement('span');
        confete.classList.add('gota');
        confete.style.marginLeft = rand + 'px';
        confete.style.backgroundColor = cor;
        confete.style.transform = 'rotate(' + rotate + 'deg)';
        confete.style.setProperty('animation-delay', 0.1 * i + 's');
        document.querySelector('body').append(confete);
    }
}

function stopChuva() {
    var filhos = document.querySelector('body').querySelectorAll('.gota');
    filhos.forEach(filho => {
        filho.parentElement.removeChild(filho);
    });
}

/**
 * Preprocessa e converte uma especificação de nível de entrada em uma saída padronizada
   input:
   {
       restrictionClasses: [
         //[              class, accepted?, rejQty, rejectionMode]
           [TRAIT.SHAPE,     true],
           [TRAIT.COLOR,     false,      2,    BOTH_SIDES]
       ],
       maxNumAnswers: 7,
       onlyCorrectAnswers: false,
       maxNumShapes: 12,
       // for non specified classes, the limit is 1
       randomLimits: [
         //[             class, max]
           [TRAIT.SIZE,   2]
       ]
   }

   output:
   {
       acceptedClasses: [TRAIT.SHAPE, ...],
       rejectedClasses: {
           // mode: [[class, qty], ...] 
           ONE_SIDE.NO_ACCEPTED: [[TRAIT.SIZE, 1], ...],
           ONE_SIDE.WITH_ACCEPTED: [[c, n], ...],
           BOTH_SIDES: [[TRAIT.COLOR, 2], ...]
       }
       maxNumAnswers: 7,
       onlyCorrectAnswers: false,
       maxNumShapes: 12,
       randomLimits : new Map([
                              [TRAIT.SHAPE, 1],
                              [TRAIT.COLOR, 1],
                              [TRAIT.SIZE, 2],
                              [TRAIT.OUTLINE, 1]
                            ])
   }
 * @param {*} input 
 * @returns output
 */
function stagePreprocessor(input) {
    'use strict';
    let acceptedClasses = [],
        rejectedClasses = {
            [ONE_SIDE.NO_ACCEPTED]: [],
            [ONE_SIDE.WITH_ACCEPTED]: [],
            [BOTH_SIDES]: []
        };

    let restrictionClasses = [];
    //  validar entrada
    if (input.restrictionClasses.length === 0)
        throw new Error('Nenhuma classe de restrição foi especificada');

    let classesUso = new Map([...TRAIT].map(classe => [classe, false]));
    for (let [traitClass, accepted, rejQty, rejectionMode] of input.restrictionClasses) {
        if (classesUso.get(traitClass)) {
            console.warn('Ignorando classe de restrição repetida: ', traitClass);
            continue;
        }
        classesUso.set(traitClass, true);

        // checa se a classe é válida
        if (![...TRAIT].includes(traitClass)) {
            console.error('Classe de restrição inválida: ', traitClass, '\nIgnorando.');
            continue;
        }

        if (!accepted) {
            // checa se a quantidade de rejeição é válida
            if (!Number.isInteger(rejQty) || rejQty <= 0) {
                console.error('Classe de restrição com quantidade de rejeição inválida: ', traitClass, '\nIgnorando.');
                continue;
            }
            // checa se rejectionMode é válido
            if (rejectionMode !== ONE_SIDE.NO_ACCEPTED && rejectionMode !== ONE_SIDE.WITH_ACCEPTED && rejectionMode !== BOTH_SIDES) {
                console.error('Modo de rejeição inválido para classe: ', traitClass, rejectionMode, '\nIgnorando.');
                continue;
            }

            if (rejQty > traitClass.length) {
                console.error('Quantidade de rejeição maior que o número de características da classe: ', traitClass, '\nUsando o máximo possível.');
                rejQty = traitClass.length;
            }
            // correções sobre ONE_SIDE.WITH_ACCEPTED. Não se pode usar todas as características da classe, pois essa situação é equivalente
            // a ter a mesma característica aceita em ambas as caixas.
            // Ex: [SQUARE, CIRCLE, TRIANGLE] rejeitadas e [RECTANGLE] aceita == [RECTANGLE] aceita e [RECTANGLE] aceita.

            // classes com menos de 3 características não podem ser ONE_SIDE.WITH_ACCEPTED, pois length([aceita, rejeita]) == length(classe)
            if (rejectionMode === ONE_SIDE.WITH_ACCEPTED && traitClass.length < 3) {
                console.error('Modo de rejeição ONE_SIDE.WITH_ACCEPTED não pode ser usado para classes com menos de 3 características: ', traitClass, '\nUsando ONE_SIDE.NO_ACCEPTED.');
                rejectionMode = ONE_SIDE.NO_ACCEPTED;
            }
            // Não permitir que todas as características de uma classe sejam usadas no ONE_SIDE.WITH_ACCEPTED,
            if (rejectionMode === ONE_SIDE.WITH_ACCEPTED && rejQty > traitClass.length - 2) {
                console.error('Quantidade de rejeição muito alto para ONE_SIDE.WITH_ACCEPTED (> classe.length - 2) da classe: ', traitClass, '\nUsando o máximo possível.');
                rejQty = traitClass.length - 2; // evita a situação equivalente a ter a mesma característica aceita em ambos os lados
            }


            if (rejectionMode === BOTH_SIDES && rejQty < 2) {
                console.error('Modo de rejeição BOTH_SIDES requer pelo menos 2 características rejeitadas: ', traitClass, '\nUsando 2.');
                rejQty = 2;
            }
        }
        restrictionClasses.push([traitClass, accepted, rejQty, rejectionMode]);
    }

    for (let [traitClass, accepted, rejQty, rejectionMode] of restrictionClasses) {
        if (accepted)
            acceptedClasses.push(traitClass);
        else
            rejectedClasses[rejectionMode].push([traitClass, rejQty]);
    }

    // se a classe não foi especificada em randomParameters, limitar a 1 característica
    let randomLimits = new Map([...TRAIT].map(classe => [classe, 1]));
    for (const [classe, max] of input.randomLimits)
        randomLimits.set(classe, max);

    // ajuda a criar uma variedade extra no jogo, mesmo que a mesma entrada seja dada
    shuffleArray(acceptedClasses);
    // ordenar inversamente cada tipo de rejeição por quantidade de rejeições dessa classe
    rejectedClasses[0].sort((a, b) => b[1] - a[1]);
    rejectedClasses[1].sort((a, b) => b[1] - a[1]);
    rejectedClasses[2].sort((a, b) => b[1] - a[1]);


    return {
        acceptedClasses: acceptedClasses,
        rejectedClasses: rejectedClasses,
        maxNumAnswers: input.maxNumAnswers,
        onlyCorrectAnswers: !!input.onlyCorrectAnswers, // '!!' força booleano
        maxNumShapes: input.maxNumShapes,
        randomLimits: randomLimits
    };
}


endGame = false;
let gRespostasCertasEsquerda = null;
let gRespostasCertasDireita = null;
let gRestricoesEsquerda = null;
let gRestricoesDireita = null;
let gOpcoes = null;
function game() {
    'use strict';
    reset();
    var textNumeroFaseDom = document.getElementById(textNumeroFase);
    textNumeroFaseDom.innerHTML = (etapaAtual + 1);

    // TODO: make first stages easier, with just the correct answers
    /* 
    TODO:
        if intersecaoAtiva:
            check if there's more than one restriction
        else:
            check if it's only one restriction and it's accepted
    */
    // TODO: how to make maxNumOptions random?
    // TODO: should we maximize the number of forms?
    // TODO: random will be replaced by the array of possibilities
    // TODO: check if the quantity of restrictions is smaller than the number of traits
    // TODO: check if SIZE and OUTLINE doesn't have rejection mode BOTH_SIDES or ONE_SIDE.WITH_ACCEPTED
    let stageData = [
        {
            // no intersection
            restrictionClasses: [
            //  [              class, accepted?, rejQty, rejectionMode]
                [TRAIT.SHAPE,     true],
            ],
            maxNumAnswers: 2,
            onlyCorrectAnswers: true,
            maxNumShapes: 3,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [             class, max]
                [TRAIT.COLOR,   2]
            ]
        },
        {
            // with intersection
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     true],
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: true,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     true],
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // SPECIFIC TEST
            restrictionClasses: [
            //  [                class, accepted?, rejQty,        rejectionMode]
                [TRAIT.SHAPE,     false,      1, ONE_SIDE.NO_ACCEPTED], 
                [TRAIT.COLOR,     true],
                [TRAIT.SIZE,      true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected
            restrictionClasses: [
            //  [                class, accepted?, rejQty,        rejectionMode]
                [  TRAIT.SHAPE,     false,      1, ONE_SIDE.NO_ACCEPTED], 
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 2 rejections
            restrictionClasses: [
            //  [                class, accepted?, rejQty,        rejectionMode]
                [  TRAIT.SHAPE,     false,      2, ONE_SIDE.NO_ACCEPTED], 
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 2 rejections with one accepted
            restrictionClasses: [
            //  [                class, accepted?, rejQty,          rejectionMode]
                [  TRAIT.SHAPE,     false,      2, ONE_SIDE.WITH_ACCEPTED], 
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 3 rejections on both sides
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     false,      3,    BOTH_SIDES], 
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 3 rejections on both sides. Random maxed out
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     false,      3,    BOTH_SIDES], 
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            onlyCorrectAnswers: false,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  3],
                [   TRAIT.SIZE,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 3 rejections on both sides. Random maxed out, all restrictions
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     false,      3,    BOTH_SIDES], 
                [TRAIT.OUTLINE,     true],
                [  TRAIT.COLOR,     true],
                [   TRAIT.SIZE,     true]
            ],
            maxNumAnswers: 9,
            onlyCorrectAnswers: false,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  3],
                [   TRAIT.SIZE,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, just rejected (all maxed out). Random maxed out
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     false,      3,    BOTH_SIDES], 
                [  TRAIT.COLOR,     false,      2,    BOTH_SIDES],
                [   TRAIT.SIZE,     false,      1,    ONE_SIDE.NO_ACCEPTED],
                [TRAIT.OUTLINE,     false,      1,    ONE_SIDE.NO_ACCEPTED]
            ],
            maxNumAnswers: 9,
            onlyCorrectAnswers: false,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  3],
                [   TRAIT.SIZE,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // ONE_SIDE.WITH_ACCEPTED preprocessor test
            // SHAPE rejQty is too high!
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     false,      3,    ONE_SIDE.WITH_ACCEPTED], 
                [  TRAIT.COLOR,     false,      2,    BOTH_SIDES],
            ],
            maxNumAnswers: 9,
            onlyCorrectAnswers: false,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  4],
                [  TRAIT.COLOR,  3],
                [   TRAIT.SIZE,  2],
                [TRAIT.OUTLINE,  2]
            ]
        },
        {
            // with intersection, just rejected (all maxed out). Random maxed out
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  TRAIT.SHAPE,     false,      2,    BOTH_SIDES], 
                [  TRAIT.COLOR,     true],
                [TRAIT.OUTLINE,     true]
            ],
            maxNumAnswers: 9,
            onlyCorrectAnswers: false,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  TRAIT.SHAPE,  2],
                [  TRAIT.COLOR,  3],
                [   TRAIT.SIZE,  1],
                [TRAIT.OUTLINE,  2]
            ]
        },
    ];

    let currentStage = stagePreprocessor(stageData[etapaAtual % stageData.length]);
    let intersecaoAtiva = etapaAtual >= 10;
    endGame = etapaAtual + 1 >= etapaMax;

    // TODO: remove this after testing
    if (etapaAtual % stageData.length !== 0)
        intersecaoAtiva = true;
    else
        intersecaoAtiva = false;
    etapaMax = stageData.length;
    endGame = etapaAtual + 1 >= etapaMax;

    // TODO: comment this out when done

    let [acceptedRestrictionsLeft,
         rejectedRestrictionsLeft,
         acceptedRestrictionsRight,
         rejectedRestrictionsRight,
         caixaEsquerdaItems,
         caixaIntersecaoItems,
         caixaDireitaItems] = gerarNivel(currentStage, intersecaoAtiva);

    // colocar as repostas nas referências globais para ser usado na checagem da resposta
    let respostasCertasEsquerda = new Set([...acceptedRestrictionsLeft.get().map(caracteristica => [caracteristica, ACCEPTED]),
                                           ...rejectedRestrictionsLeft.get().map(caracteristica => [caracteristica, REJECTED])]);
    let respostasCertasDireita = new Set([...acceptedRestrictionsRight.get().map(caracteristica => [caracteristica, ACCEPTED]),
                                          ...rejectedRestrictionsRight.get().map(caracteristica => [caracteristica, REJECTED])]);
    

    // adicionar as restrições corretas nas respostas
    let respostasItems = [...respostasCertasEsquerda, ...respostasCertasDireita];
    // gerar regras que são incorretas
    // obter as regras comuns à todos items da interseção
    let restricoesIntersecao;
    if (caixaIntersecaoItems.length > 0)
        restricoesIntersecao = new RestrictionSet(caixaIntersecaoItems);
    else
        // creates the universal set, so that the intersections don't return empty sets
        restricoesIntersecao = new RestrictionSet([]).union(new RestrictionSet([]).complement());
    let restricoesEsquerda = new RestrictionSet(caixaEsquerdaItems).intersection(restricoesIntersecao);
    let restricoesDireita = new RestrictionSet(caixaDireitaItems).intersection(restricoesIntersecao);

    let restricoesUsadas = restricoesEsquerda.union(restricoesDireita);
    let restricoesNaoUsadas = new RestrictionSet().complement().difference(restricoesUsadas);

    let restricoesNaoUsadasArray = restricoesNaoUsadas.toRestrictionArray();
    shuffleArray(restricoesNaoUsadasArray);
    if (currentStage.onlyCorrectAnswers)
        restricoesNaoUsadasArray = []; // sem respostas erradas

    // completar as respostas com as regras incorretas para respostasItems ter currentStage.numOptions
    respostasItems = respostasItems.concat(restricoesNaoUsadasArray).slice(0, currentStage.maxNumAnswers);
    shuffleArray(respostasItems);

    // colocar as restrições nas referências globais para ser usado na checagem da resposta
    gRestricoesEsquerda = restricoesEsquerda;
    gRestricoesDireita = restricoesDireita;

    /*Containers*/
    let divRespostas = document.getElementById(divRespostasId);
    // TODO: cull these unused variales?
    let divRestricaoEsquerda = document.getElementById(divRestricaoEsquerdaId);
    let divRestricaoDireita = document.getElementById(divRestricaoDireitaId);

    let divCaixaEsquerda = document.getElementById(divCaixaEsquerdaId);
    let divCaixaDireita = document.getElementById(divCaixaDireitaId);
    let divCaixaIntersecao = document.getElementById(divCaixaIntersecaoId);

    //renderizando restrições em "regras disponíveis"
    gRespostasCertasEsquerda = [];
    gRespostasCertasDireita = [];
    gOpcoes = respostasItems;
    respostasItems.forEach((item, i) => {
        let imgTag = document.createElement("img");
        imgTag.src = TRAIT_EXTRA.getRestricaoScr(item);
        imgTag.alt = TRAIT_EXTRA.getRestricaoAlt(item);
        imgTag.title = imgTag.alt;
        imgTag.setAttribute('data-index', i);
        imgTag.classList.add('drag');
        //imgTag.classList.add('game-img');
        //imgTag.classList.add('img-restricao-esquerda');
        if (respostasCertasEsquerda.has(item))
            gRespostasCertasEsquerda.push(imgTag);
        else if (respostasCertasDireita.has(item))
            gRespostasCertasDireita.push(imgTag);
        divRespostas.appendChild(imgTag);
    });

    //Registra o evento click e aparece as informações da peça na tela.
    let modalInfoTrigger = (e) => {
			botaoOk.onclick = function (event){
				modalInfo.style.display = 'none';
			};
			modalInfo.style.display = 'block';
			textoInfo.innerHTML = e.target.alt;
			document.getElementById('img-info-peca').src = e.target.src;
			botaoOk.innerHTML = "Ok";
    };

    caixaEsquerdaItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = TRAIT_EXTRA.getFormaSrc(item);
        imgTag.alt = TRAIT_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(TRAIT.SIZE) === TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        // TODO: remove this duplicated line
        imgTag.classList.add(item.get(TRAIT.SIZE) === TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        imgTag.addEventListener('click', modalInfoTrigger);
        divCaixaEsquerda.appendChild(imgTag);
    });

    caixaDireitaItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = TRAIT_EXTRA.getFormaSrc(item);
        imgTag.alt = TRAIT_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(TRAIT.SIZE) == TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        imgTag.addEventListener('click', modalInfoTrigger);
        divCaixaDireita.appendChild(imgTag);
    });

    caixaIntersecaoItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = TRAIT_EXTRA.getFormaSrc(item);
        imgTag.alt = TRAIT_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(TRAIT.SIZE) == TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        imgTag.addEventListener('click', modalInfoTrigger);
        divCaixaIntersecao.appendChild(imgTag);
    });


    // configurar o visual das caixas
    // TODO: apply just once!
    let dropzoneArea = document.getElementById('dropzone-container-grupos-regras');
    if (!intersecaoAtiva) {

        divCaixaEsquerda.setAttribute('style', 'grid-column: 2/3; grid-row: 1/4;');
        divCaixaDireita.setAttribute('style', 'grid-column: 4/5; grid-row: 1/4; align-content: flex-start');
        divCaixaIntersecao.setAttribute('style', 'display: none;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr 5fr 1fr 5fr 2fr;');
        divCaixaEsquerda.classList.remove('drop-meio-ativo');
        divCaixaIntersecao.classList.remove('drop-meio-ativo');
        divCaixaDireita.classList.remove('drop-meio-ativo');
        divRestricaoDireita.setAttribute('style', 'grid-row: 1/4;');
    } else {
        divCaixaEsquerda.setAttribute('style', 'grid-column: 2/4; grid-row: 1/3;');
        divCaixaDireita.setAttribute('style', 'grid-column: 3/5; grid-row: 2/4; align-content: flex-end');
        divCaixaIntersecao.setAttribute('style', 'grid-column: 3/4; grid-row: 2/3;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr repeat(3, 3fr) 2fr;');
        divCaixaEsquerda.classList.add('drop-meio-ativo');
        divCaixaIntersecao.classList.add('drop-meio-ativo');
        divCaixaDireita.classList.add('drop-meio-ativo');
        divCaixaDireita.setAttribute('align-content', 'flex-end');
        divRestricaoDireita.setAttribute('style', 'grid-row: 2/4;');
    }

    //implementando interrogação

    console.log("CERTAS ESQUERDA: " + gRespostasCertasEsquerda.length);
    console.log("CERTAS DIREITA: " + gRespostasCertasDireita.length);

    let interrogacaoEspaco = 50 + 10; // altura da img da restrição + margem
 
    let interrogacaoEsq = document.getElementById("container-restricao-esquerda");
    interrogacaoEsq.style.backgroundImage = "url('../img/bg-slot.svg'),".repeat(gRespostasCertasEsquerda.length).slice(0, -1);
    interrogacaoEsq.style.backgroundRepeat = "no-repeat,".repeat(gRespostasCertasEsquerda.length).slice(0, -1);
    interrogacaoEsq.style.backgroundPosition = Array(gRespostasCertasEsquerda.length).fill(`top Xpx right 10px`).map((str, i) => str.replace("X", i*interrogacaoEspaco)).join(",");
 
    let interrogacaoDir = document.getElementById("container-restricao-direita");
    interrogacaoDir.style.backgroundImage = "url('../img/bg-slot.svg'),".repeat(gRespostasCertasDireita.length).slice(0, -1);
    interrogacaoDir.style.backgroundRepeat = "no-repeat,".repeat(gRespostasCertasDireita.length).slice(0, -1);
    interrogacaoDir.style.backgroundPosition = Array(gRespostasCertasDireita.length).fill(`top Xpx left 10px`).map((str, i) => str.replace("X", i*interrogacaoEspaco)).join(",");
}

const [RESPOSTA_CORRETA, RESPOSTA_INCOMPLETA, RESPOSTA_ERRADA] = [1, 2, 3];

/**
 * determina se a resposta está incompleta ou incorreta
 * @param {Array<Number, boolean>[]} respostasOpcoes Array contendo as respostas que ficaram no array de opções
 * @returns RESPOSTA_INCOMPLETA se não moveu todas as imagens, RESPOSTA_ERRADA se moveu mas errou
 */
function quaoIncorreto(respostasOpcoes) {
    let respostasOpcoesSet = new Set(respostasOpcoes);
    // checa se há respostas corretas nas opções
    // se tiver, o usuário não moveu todas ainda, retornar RESPOSTA_INCOMPLETA
    // se não tiver, o usuário moveu, mas arrajou as respostas de forma incorreta, retornar RESPOSTA_ERRADA
    if (gRespostasCertasEsquerda.some(x => respostasOpcoesSet.has(x)))
        return RESPOSTA_INCOMPLETA;
    if (gRespostasCertasDireita.some(x => respostasOpcoesSet.has(x)))
        return RESPOSTA_INCOMPLETA;

    return RESPOSTA_ERRADA;
}

/**
 * confere se o usuário acertou a reposta
 * @returns RESPOSTA_CORRETA se acertou, RESPOSTA_INCOMPLETA se não moveu todas as imagens, RESPOSTA_ERRADA se moveu mas errou
 */
function checarResposta() {
    'use strict';
    let respostasEsquerda = [...document.getElementById(divRestricaoEsquerdaId).children];
    let respostasDireita = [...document.getElementById(divRestricaoDireitaId).children];
    let respostasEsquerdaSet = new Set(respostasEsquerda);
    let respostasDireitaSet = new Set(respostasDireita);
    let respostasOpcoes = [...document.getElementById(divRespostasId).children];

    // checar se os arrays são do mesmo tamanho
    if (respostasEsquerdaSet.size !== gRespostasCertasEsquerda.length ||
        respostasDireitaSet.size !== gRespostasCertasDireita.length)
        return quaoIncorreto(respostasOpcoes);

    // checar se todas as respostas corretas foram arrastadas
    if (!gRespostasCertasEsquerda.every(resposta => respostasEsquerdaSet.has(resposta) || respostasDireitaSet.has(resposta)) || 
        !gRespostasCertasDireita.every(resposta => respostasEsquerdaSet.has(resposta) || respostasDireitaSet.has(resposta)))
        return quaoIncorreto(respostasOpcoes);

    // checar se a resposta dada é a mesma que foi definida
    if (gRespostasCertasEsquerda.every(resposta => respostasEsquerdaSet.has(resposta)) &&
        gRespostasCertasDireita.every(resposta => respostasDireitaSet.has(resposta)))
        return RESPOSTA_CORRETA;

    // checar se a resposta pode ser válida (nível com mais de uma resposta correta)
    respostasEsquerda = respostasEsquerda.map(el => gOpcoes[el.dataset.index]);
    respostasDireita = respostasDireita.map(el => gOpcoes[el.dataset.index]);

    if (!respostasEsquerda.every(([caracteristica, accepted]) => gRestricoesEsquerda.has(caracteristica, accepted)) ||
        !respostasDireita.every(([caracteristica, accepted]) => gRestricoesDireita.has(caracteristica, accepted)))
        return quaoIncorreto(respostasOpcoes);

    return RESPOSTA_CORRETA;
}

/**
 * Função da UI que é chamada quando o usuário clica no botão de checar resposta
 * Confere se a resposta está correta e mostra a mensagem apropriada
 */
function check() {

    let textoAcerto = document.getElementById('resultado-jogo');
    let textoErro = document.getElementById('resultadoNegativo-jogo');

    let modalAcerto = document.getElementById("modalAcerto");
    let modalErro = document.getElementById('modalErro');
    let modalFim = document.getElementById('modalFim');

    let btnReiniciar = document.getElementById('botao-restart');
    let botaoOk = document.getElementById('botao-proximo');

    let respostaExatidao = checarResposta();
    switch (respostaExatidao) {
        case RESPOSTA_ERRADA:
            modalErro.style.display = 'block';
            textoErro.innerText = 'Resposta errada... Tente novamente!';
            break;

        case RESPOSTA_INCOMPLETA:
            modalErro.style.display = 'block';
            textoErro.innerText = 'Você ainda não moveu todas as imagens... Tente novamente.';
            break;

        case RESPOSTA_CORRETA:
            if (endGame) {
                chuva();
                textoAcerto.innerHTML = "Você concluiu o jogo! Parabens!";
                modalFim.style.display = 'block';
                btnReiniciar.onclick = function (event) {
                    stopChuva();
                    etapaAtual = 0;
                    endGame = false;
                    resetEstrelas();
                    game();
                    modalFim.style.display = 'none';
                };
            }
            else {
                modalAcerto.style.display = 'block';
                textoAcerto.innerText = 'Você acertou! Fase concluída.';
                botaoOk.innerHTML = "Próxima";
                botaoOk.onclick = function (event) {
                    etapaAtual++;
                    estrela++;
                    switch (estrela) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                        case 9:
                            document.getElementById('texto1').innerHTML = etapaAtual.toString() + "/10";
                            break;
                        case 10:
                            arrayEstrelas[0].setAttribute('src', '../img/estrelas/star1.svg');
                            document.getElementById('texto1').innerHTML = etapaAtual.toString() + "/10";
                            break;
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                        case 16:
                        case 17:
                        case 18:
                        case 19:
                            document.getElementById('texto2').innerHTML = etapaAtual.toString() + "/20";
                            break;
                        case 20:
                            arrayEstrelas[1].setAttribute('src', '../img/estrelas/star1.svg');
                            document.getElementById('texto2').innerHTML = etapaAtual.toString() + "/20";
                            break;
                        case 21:
                        case 22:
                        case 23:
                        case 24:
                        case 25:
                        case 26:
                        case 27:
                        case 28:
                        case 29:
                            document.getElementById('texto3').innerHTML = etapaAtual.toString() + "/30";
                            break;
                        case 30:
                            arrayEstrelas[2].setAttribute('src', '../img/estrelas/star1.svg');
                            document.getElementById('texto3').innerHTML = etapaAtual.toString() + "/30";
                            break;
                        case 31:
                        case 32:
                        case 33:
                        case 34:
                        case 35:
                        case 36:
                        case 37:
                        case 38:
                            document.getElementById('texto4').innerHTML = etapaAtual.toString() + "/40";
                            break;
                        case 39:
                            arrayEstrelas[3].setAttribute('src', '../img/estrelas/star1.svg');
                            document.getElementById('texto4').innerHTML = etapaAtual.toString() + "/40";
                            break;
                        default:
                            break;
                    }
                    game();
                    modalAcerto.style.display = 'none';
                };
            }
            break;
    }
}

document.body.onload = game();
var botaoResultado = document.getElementById('botao-resultado');
botaoResultado.addEventListener('click', check);
