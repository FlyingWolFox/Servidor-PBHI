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
var etapaMax;

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

let levels = [];
let levelPartStarts = [];
function genLevels() {
    'use strict';

    // *** generator input ***

    /*
    The level generator expands the levels specified here. So you can put arrays
    on the parameters and the levels will follow that sequence.
    accepted: [2, 3] -> [level(2 accepted), level(3 accepted)]
    accepted: 2 == accepted: [2] -> [level(2 accepted), level(2 accepted), ...]

    numLevelBase is the base number of levels generated for that level. It'll be
    multiplied by levelMutiplier to get the actual number of levels generated.
    A recommend value for this number is the size of the biggest array you're
    providing, so that it isn't cut, but you can put anything and it'll respond.
    These arrays will be expanded or trimmed accordingly, no matter
    the multiplier or level base number.

    accepted -> trait accepted in one box
    osna -> ONE_SIZE.NO_ACCEPTED, trait rejected in one box
    oswa -> ONE_SIZE.WITH_ACCEPTED, same as above, but a accepted in the other box
    both -> BOTH_SIZES, trait rejected in both boxes

    the sum of the above can't be bigger than 4, since there's only 4 types of traits

    oswa and both shouldn't be bigger than 2 (neither their sum), since only
    TRAIT.SHAPE and TRAIT.COLOR can be used without the chance of creating an
    empty box (that'll crash the shape generator, game-algorithms.js:gerarSets),
    but even if that doesn't happen, that isn't that much useful (the why is
    left as an exercise for the reader)
    */
    const levelMultiplier = 2; // resizes the game (2 = 2x bigger, 0.5 = 2x smaller)
    let levelsToGen = [
        /* FORMAT:
        {
            traitTypesAvailable: TRAIT, // trait types to be used on the level
            accepted: [1, 2, 1, 0], // num/squence of num of accepted trait types.
            osna: [1, 2, 3],
            oswa: 0,
            both: 0,
            numLevelsBase: 4, // base number of levels to generate
            firstLevelHasOnlyCorrectAnswers: true // if true, the first level will only have correct answers
        } */
        // part 0: introduce shapes
        {
            traitTypesAvailable: [TRAIT.SHAPE], // values besides TRAIT should be put in an array
            accepted: 1,
            osna: 0,
            oswa: 0,
            both: 0,
            numLevelsBase: 2,
            firstLevelHasOnlyCorrectAnswers: true
        },
        // part 1: introduce colors
        {
            traitTypesAvailable: [TRAIT.COLOR],
            accepted: 1,
            osna: 0,
            oswa: 0,
            both: 0,
            numLevelsBase: 1,
            firstLevelHasOnlyCorrectAnswers: true
        },
        // part 2: introduce sizes
        {
            traitTypesAvailable: [TRAIT.SIZE],
            accepted: 1,
            osna: 0,
            oswa: 0,
            both: 0,
            numLevelsBase: 1,
            firstLevelHasOnlyCorrectAnswers: true
        },
        // part 3: introduce outlines
        {
            traitTypesAvailable: [TRAIT.OUTLINE],
            accepted: 1,
            osna: 0,
            oswa: 0,
            both: 0,
            numLevelsBase: 1,
            firstLevelHasOnlyCorrectAnswers: true
        },
        // part 4: introduce intersection
        {
            traitTypesAvailable: TRAIT,
            accepted: [2, 3, 4],
            osna: 0,
            oswa: 0,
            both: 0,
            numLevelsBase: 3,
            firstLevelHasOnlyCorrectAnswers: false
        },
        // part 5: introduce rejections
        {
            traitTypesAvailable: TRAIT,
            accepted: [1, 2, 1, 0],
            osna: [1, 2, 2, 2],
            oswa: [0, 0, 1, 2],
            both: 0,
            numLevelsBase: 4,
            firstLevelHasOnlyCorrectAnswers: false
        },
        // part 6: introduce rejections on both sides
        {
            traitTypesAvailable: TRAIT,
            accepted: [1, 2, 1, 0],
            osna: [0, 0, 0, 1],
            oswa: [0, 0, 1, 0],
            both: [1, 2, 2, 2],
            numLevelsBase: 4,
            firstLevelHasOnlyCorrectAnswers: false
        },
    ];


    // definitions

    // expands or shrink a sequence to a target size
    // if the sequence is too small, it'll be repeated
    // if the sequence is too big, it'll be trimmed
    // ex:
    // resizeSequence([1, 2, 3, 4], 2) -> [1, 2]
    // resizeSequence([1, 2], 4) -> [1, 1, 2, 2]
    // resizeSequence(1, 4) -> [1, 1, 1, 1]
    function resizeSequence(seq, targetSize) {
        targetSize = Math.round(targetSize);
        if (typeof seq === 'number')
            return Array(targetSize).fill(seq);

        if (seq.length >= targetSize)
            return seq.slice(0, targetSize);

        // (i * r*(n-1)/(m-1)) for r in range(m))
        // i = index, m = targetSize, r = seq.length
        let result = [];
        const factor = (seq.length - 1) / (targetSize - 1);
        for (let i = 0; i < targetSize; i++)
            result.push(seq[Math.round(i * factor)]);
        return result;
    }

    // finds value on array and removes it
    // returns the value or null if not found
    function findAndPop(arr, value) {
        let index = arr.indexOf(value);
        if (index > -1)
            return arr.splice(index, 1)[0];
        return null;
    }

    // maximum number of restrictions for each type of trait and restriction type:
    const RESTRICTION_NUM = new Map([
        [TRAIT.SHAPE, {accepted: 1, [ONE_SIDE.NO_ACCEPTED]: 3, [ONE_SIDE.WITH_ACCEPTED]: 2, [BOTH_SIDES]: 3}],
        [TRAIT.COLOR, {accepted: 1, [ONE_SIDE.NO_ACCEPTED]: 2, [ONE_SIDE.WITH_ACCEPTED]: 1, [BOTH_SIDES]: 2}],
        [TRAIT.SIZE, {accepted: 1, [ONE_SIDE.NO_ACCEPTED]: 1, [ONE_SIDE.WITH_ACCEPTED]: 0, [BOTH_SIDES]: 1}],
        [TRAIT.OUTLINE, {accepted: 1, [ONE_SIDE.NO_ACCEPTED]: 1, [ONE_SIDE.WITH_ACCEPTED]: 0, [BOTH_SIDES]: 1}]
    ]);


    // *** level generation ***

    for (let level of levelsToGen) {
        // a partStart is the index of the first level of a level in levelToGen
        // you can use the comments with "part n: ..." to find the index of the
        // partStart that you want to use
        levelPartStarts.push(levels.length);

        // resize the arrays of the leve
        level.accepted = resizeSequence(level.accepted, level.numLevelsBase * levelMultiplier);
        level.osna = resizeSequence(level.osna, level.numLevelsBase * levelMultiplier);
        level.oswa = resizeSequence(level.oswa, level.numLevelsBase * levelMultiplier);
        level.both = resizeSequence(level.both, level.numLevelsBase * levelMultiplier);
        // num of restriction to use in the level. This is a minimum value
        level.restrictionNum = resizeSequence([2, 3, 4, 5, 6, 7], level.numLevelsBase * levelMultiplier);
        // ratio of correct answers that'll be used to gen wrong answers (not a general ratio of answers!)
        level.wrongAnswersRatio = resizeSequence([0.3, 0.5, 0.7, 0.9, 1.1], level.numLevelsBase * levelMultiplier);
        // limits to randomness. This is a minimum value
        level.randomLimit = new Map([
            [TRAIT.SHAPE, resizeSequence([1, 2, 2, 2, 3, 3, 4], level.numLevelsBase * levelMultiplier)],
            [TRAIT.COLOR, resizeSequence([1, 2, 2, 2, 2, 3, 3], level.numLevelsBase * levelMultiplier)],
            [TRAIT.SIZE, resizeSequence([1, 1, 2, 2, 2, 2, 2], level.numLevelsBase * levelMultiplier)],
            [TRAIT.OUTLINE, resizeSequence([1, 1, 1, 2, 2, 2, 2], level.numLevelsBase * levelMultiplier)],
        ]);
        level.numLevelsBase *= levelMultiplier;

        for (let i = 0; i < level.numLevelsBase; i++) {
            const newLevelGen = {
                traitTypesAvailable: level.traitTypesAvailable,
                accepted: level.accepted[i],
                osna: level.osna[i],
                oswa: level.oswa[i],
                both: level.both[i],
                restrictionNum: level.restrictionNum[i],
                onlyCorrectAnswers: level.firstLevelHasOnlyCorrectAnswers && i === 0,
                wrongAnswersRatio: level.wrongAnswersRatio[i],
                randomLimit: new Map([
                    [TRAIT.SHAPE, level.randomLimit.get(TRAIT.SHAPE)[i]],
                    [TRAIT.COLOR, level.randomLimit.get(TRAIT.COLOR)[i]],
                    [TRAIT.SIZE, level.randomLimit.get(TRAIT.SIZE)[i]],
                    [TRAIT.OUTLINE, level.randomLimit.get(TRAIT.OUTLINE)[i]]
                ])
            };

            const traitsAvailable = shuffleArray([...newLevelGen.traitTypesAvailable]);
            const traitsToUse = newLevelGen.accepted + newLevelGen.osna + newLevelGen.oswa + newLevelGen.both;
            if (traitsToUse > traitsAvailable.length)
                throw Error(`Not enough traits to generate level ${i} of ${level.numLevelsBase} (need ${traitsToUse} but only have ${traitsAvailable.length})`);
            if (newLevelGen.oswa > 2 || newLevelGen.both > 2)
                throw Error(`Too many traits to generate level ${i} of ${level.numLevelsBase} (oswa: ${newLevelGen.oswa}, both: ${newLevelGen.both}). Max 2 traits with these types of restriction`);

            // always put TRAIT.SIZE and TRAIT.OUTLINE in the end of the list
            // almost garantees that they'll be put as 'accepted' or ONE_SIDE.NO_ACCEPTED
            // (if they're not, they'll be put in ONE_SIDE.WITH_ACCEPTED or BOTH_SIDES and that _may_ fuck things up)
            // (when that happenned to me, nothing broke, but answering it wasn't interisting)
            const specialClasses = [findAndPop(traitsAvailable, TRAIT.SIZE), findAndPop(traitsAvailable, TRAIT.OUTLINE)].filter(x => x !== null);
            for (const specialClass of specialClasses)
                traitsAvailable.push(specialClass);

            let restrictionClasses = new Map(shuffleArray([
                [BOTH_SIDES, traitsAvailable.splice(0, newLevelGen.both)],
                [ONE_SIDE.WITH_ACCEPTED, traitsAvailable.splice(0, newLevelGen.oswa)],
                [ONE_SIDE.NO_ACCEPTED, traitsAvailable.splice(0, newLevelGen.osna)],
                ['accepted', traitsAvailable.splice(0, newLevelGen.accepted)],
            ]));

            let restrictionsUsed = traitsToUse === 1 ? 1 : 0; // fix for when there's not an intersection (early levels)
            for (let [restrictionClass, traitTypes] of restrictionClasses.entries()) {
                if (traitTypes.length === 0)
                    continue;

                for (let i = 0; i < traitTypes.length; i++) {
                    if (restrictionClass === BOTH_SIDES) {
                        traitTypes[i] = [traitTypes[i], 2];
                        restrictionsUsed += 2;
                    } else {
                        traitTypes[i] = [traitTypes[i], 1];
                        restrictionsUsed++;
                    }
                }
            }

            while (true) {
                let beforeNums = [...restrictionClasses.values()].map(t => t[1]);
                for (let [restrictionClass, traitTypes] of restrictionClasses.entries()) {
                    for (let traitSpec of traitTypes) {
                        let [traitType, num] = traitSpec;
                        if (restrictionsUsed > newLevelGen.restrictionNum)
                            break;
                        if (num >= RESTRICTION_NUM.get(traitType)[restrictionClass])
                            continue;

                        traitSpec[1]++;
                        restrictionsUsed++;
                    }
                }
                let afterNums = [...restrictionClasses.values()].map(t => t[1]);
                if (beforeNums.every((v, i) => v === afterNums[i]))
                    break; // no more restrictions could be added
            }

            // 1 is always used in randomLimit
            // I sum here to give the shape generator something that isn't just the restriction, so levels aren't shit to solve
            let finalTypeTraitNums = new Map([[TRAIT.SHAPE, 1], [TRAIT.COLOR, 1], [TRAIT.SIZE, 1], [TRAIT.OUTLINE, 1]]);
            for (const [restrictionClass, traitTypes] of restrictionClasses.entries()) {
                for (const [traitType, num] of traitTypes) {
                    if (restrictionClass === ONE_SIDE.WITH_ACCEPTED)
                        finalTypeTraitNums.set(traitType, num + 2); // adds the accepted trait too
                    else
                        finalTypeTraitNums.set(traitType, num + 1);
                }
            }
            // cap. Not capping may affect negatively the shape generator due to its greedy algorithm
            const NUM_LIMITS = new Map([
                [TRAIT.SHAPE, 4],
                [TRAIT.COLOR, 3],
                [TRAIT.SIZE, 2],
                [TRAIT.OUTLINE, 2],
            ]);
            for (let [traitType, num] of finalTypeTraitNums.entries()) {
                if (num > NUM_LIMITS.get(traitType))
                    finalTypeTraitNums.set(traitType, NUM_LIMITS.get(traitType));
            }


            levels.push({
                acceptedClasses: restrictionClasses.get('accepted').map(t => t[0]), // remove the num, since it's always 1
                rejectedClasses: {
                    [ONE_SIDE.NO_ACCEPTED]: restrictionClasses.get(ONE_SIDE.NO_ACCEPTED),
                    [ONE_SIDE.WITH_ACCEPTED]: restrictionClasses.get(ONE_SIDE.WITH_ACCEPTED),
                    [BOTH_SIDES]: restrictionClasses.get(BOTH_SIDES)
                },
                maxNumAnswers: Math.round((1 + newLevelGen.wrongAnswersRatio) * restrictionsUsed),
                onlyCorrectAnswers: newLevelGen.onlyCorrectAnswers,
                maxNumShapes: 18, // arbitraty number, but seems to be good enough
                randomLimits: new Map([
                    [TRAIT.SHAPE, Math.max(finalTypeTraitNums.get(TRAIT.SHAPE), newLevelGen.randomLimit.get(TRAIT.SHAPE))],
                    [TRAIT.COLOR, Math.max(finalTypeTraitNums.get(TRAIT.COLOR), newLevelGen.randomLimit.get(TRAIT.COLOR))],
                    [TRAIT.SIZE, Math.max(finalTypeTraitNums.get(TRAIT.SIZE), newLevelGen.randomLimit.get(TRAIT.SIZE))],
                    [TRAIT.OUTLINE, Math.max(finalTypeTraitNums.get(TRAIT.OUTLINE), newLevelGen.randomLimit.get(TRAIT.OUTLINE))]
                ])
            });
        }
    }
    levelPartStarts.push(levels.length);  // push the last part start (the last level)
    if (typeof etapaMax === 'undefined')
        // don't override etapaMax if it was already set
        etapaMax = levels.length;
}
genLevels();

endGame = false;
// referências para os elementos das respostas corretas na DOM
let gRespostasCertasEsquerda = null;
let gRespostasCertasDireita = null;
// referências para as respotas corretas (formato interno)
let gRestricoesEsquerda = null;
let gRestricoesDireita = null;
// referências para todas as respostas (formato interno)
let gOpcoes = null;
function game() {
    'use strict';
    reset();
    var textNumeroFaseDom = document.getElementById(textNumeroFase);
    textNumeroFaseDom.innerHTML = (etapaAtual + 1);

    const currentStage = levels[etapaAtual];
    const intersecaoAtiva = etapaAtual >= levelPartStarts[4];
    endGame = etapaAtual + 1 >= etapaMax;

    let [acceptedRestrictionsLeft,
         rejectedRestrictionsLeft,
         acceptedRestrictionsRight,
         rejectedRestrictionsRight,
         caixaEsquerdaItems,
         caixaIntersecaoItems,
         caixaDireitaItems] = gerarNivel(currentStage, intersecaoAtiva);

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
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(TRAIT.SIZE) === TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        imgTag.addEventListener('click', modalInfoTrigger);
        divCaixaEsquerda.appendChild(imgTag);
    });

    caixaDireitaItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = TRAIT_EXTRA.getFormaSrc(item);
        imgTag.alt = TRAIT_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(TRAIT.SIZE) == TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        imgTag.addEventListener('click', modalInfoTrigger);
        divCaixaDireita.appendChild(imgTag);
    });

    caixaIntersecaoItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = TRAIT_EXTRA.getFormaSrc(item);
        imgTag.alt = TRAIT_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(TRAIT.SIZE) == TRAIT.SIZE.SMALL ? 'pequeno' : 'grande');
        imgTag.addEventListener('click', modalInfoTrigger);
        divCaixaIntersecao.appendChild(imgTag);
    });


    // configurar o visual das caixas
    let divRestricaoDireita = document.getElementById(divRestricaoDireitaId);
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

    // implementando interrogação

    const interrogacaoEspaco = 50 + 10; // altura da img da restrição + margem

    // repete o background-image (a interrogação) a quantidade de vezes necessária

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

    // checar se não há interrogações expostas (se um lado tem menos respostas que deveria)
    if (respostasEsquerdaSet.size < gRespostasCertasEsquerda.length ||
        respostasDireitaSet.size < gRespostasCertasDireita.length)
        return RESPOSTA_INCOMPLETA;

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
                    if (estrela <= levelPartStarts[4]) {
                        document.getElementById('texto1').innerHTML = `${etapaAtual}/${levelPartStarts[4]}`;
                        if (estrela === levelPartStarts[4])
                            arrayEstrelas[0].setAttribute('src', '../img/estrelas/star1.svg');
                    } else if (estrela <= levelPartStarts[5]) {
                        document.getElementById('texto2').innerHTML = `${etapaAtual}/${levelPartStarts[5]}`;
                        if (estrela === levelPartStarts[5])
                            arrayEstrelas[1].setAttribute('src', '../img/estrelas/star1.svg');
                    } else if (estrela <= levelPartStarts[6]) {
                        document.getElementById('texto3').innerHTML = `${etapaAtual}/${levelPartStarts[6]}`;
                        if (estrela === levelPartStarts[6])
                            arrayEstrelas[2].setAttribute('src', '../img/estrelas/star1.svg');
                    } else if (estrela <= levelPartStarts[7]) {
                        document.getElementById('texto4').innerHTML = `${etapaAtual}/${levelPartStarts[7]}`;
                        if (estrela === levelPartStarts[7])
                            arrayEstrelas[3].setAttribute('src', '../img/estrelas/star1.svg');
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
