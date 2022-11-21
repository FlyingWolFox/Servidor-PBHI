var etapaAtual = 0;   //Etapa do exercício
var estrela = 0;      //Contagem das estrelas (5 por etapa)
var endGame;
var restricao1 = [];   //Restriçoes da primeira caixa (esquerda)
var restricao2 = [];   //Restriçoes da terceira caixa (direita)
var estadoRestricao1 = []; //Imagem como proibida (Negado) / Imagem é para ser colocada (Aceito) - ESQUERDA
var estadoRestricao2 = []; //Imagem como proibida (Negado) / Imagem é para ser colocada (Aceito) - DIREITA
var imgMov1 = [];      //Confere se falta colocar alguma imagem da primeira caixa 
var imgMov2 = [];      //Confere se falta colocar alguma imagem da terceira caixa 
let quantidade = 0;

const textNumeroFase = 'textbox-numero-fase';

const divRestricaoEsquerdaId = 'container-restricao-esquerda';
const divRestricaoDireitaId = 'container-restricao-direita';

const dropEsquerdoId = 'caixa-esquerda';
const dropIntersecaoId = 'caixa-intersecao';
const dropDireitoId = 'caixa-direita';

const divCaixaEsquerdaId = 'caixa-esquerda';
const divCaixaDireitaId = 'caixa-direita';
const divCaixaIntersecaoId = 'caixa-intersecao';

const divRespostasId = 'container-respostas';

const forma = 0, cor = 1, tamanho = 2, contorno = 3;

const divEstrelas = 'container-estrelas';
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');

var ano = localStorage.getItem('ano');
var etapaMax = 25;

const anosEnum = Object.freeze({
    "Primeiro ano": 1,
    "Segundo ano": 2,
    "Terceiro ano": 3,
    "Quarto ano": 4,
    "Quinto ano": 5,
    "Sexto ano": 6
});

// gerar enum aninhado onde os elementos do subenum não possuem o mesmo valor, podendo obter o valor do enum a partir do valor do subenum
// o array members vira um objeto que funciona como um enum, ex: CARACTERISTICAS.SHAPE.SQUARE == 1.25
// exemplo de estrutura de enum gerado aqui:
// CARACTERISTIC = {
//   SHAPE: {   // id do enum = 1, já que se fazer o Math.floor de qualquer dos seus elementos, o resultado é 1
//     TRIANGLE: 1.0, // 1 + 0/4 = 1.0 (id do enum + id do elemento no subenum/quantidade de elementos do subenum)
//     SQUARE: 1.25,    // 1 + 1/4 = 1.25
//     CIRCLE: 1.5,   // 1 + 2/4 = 1.5
//     TRIANGLE: 1.75,  // 1 + 3/4 = 1.75
//     id: 1, // id do enum
//     length: 4, // quantidade de elementos do subenum
//     Symbol.iterator: function*   // função que permite iterar sobre os elementos do subenum (TRIANGLE, SQUARE, CIRCLE, TRIANGLE)
//   },
//   COLOR: {   // id do enum = 2
//     BLUE: 2.0,   // 2 + 0/4 = 2.0
//     RED: 2.3333333333333335,  // 2 + 1/3 = 2.3333333333333335
//     GREEN: 2.6666666666666665,   // 2 + 2/3 = 2.6666666666666665
//     id: 2, // id do enum
//     length: 3, // quantidade de elementos do subenum
//     Symbol.iterator: function*   // função que permite iterar sobre os elementos do subenum (BLUE, RED, GREEN)
//   },
//   length: 2, // quantidade de subenums
//   "0": "SHAPE", // permite obter o nome do subenum a partir do id do enum
//   "1": "COLOR",
//   Symbol.iterator: function*   // função que permite iterar sobre os subenums (SHAPE, COLOR)
//   getClass: function (subenumValue) // função que retorna o objeto da classe (valor enum pai) da caracteristica (valor do subenum), ex: CARACTERISTIC.getClass(CARACTERISTIC.SHAPE.SQUARE) == CARACTERISTICAS.SHAPE
//   getClassId: function (subenumValue) // mesmo que getClass, mas retorna o id do enum pai, ex: CARACTERISTIC.getClassId(CARACTERISTIC.SHAPE.SQUARE) == 0
// }
const CARACTERISTIC = function () {
    let members = [
        // [ENUM_NAME, ENUM_VALUES]
        ['COLOR', ['BLUE', 'RED', 'YELLOW']],
        ['SHAPE', ['TRIANGLE', 'SQUARE', 'RECTANGLE', 'CIRCLE']],
        ['SIZE', ['BIG', 'SMALL']],
        ['OUTLINE', ['OUTLINED', 'NOTOUTLINED']]
    ];

    let cEnum = {};
    for (let i = 0; i < members.length; i++) {
        let [memberName, memberValues] = members[i];
        cEnum[memberName] = {};
        for (let j = 0; j < memberValues.length; j++) {
            cEnum[memberName][memberValues[j]] = i + j / memberValues.length;
        }
        cEnum[memberName].id = i;
        cEnum[memberName].length = memberValues.length;
        // iterate over the carcateristics of a class
        cEnum[memberName][Symbol.iterator] = function* () {
            for (const caracteristic of memberValues) {
                yield cEnum[memberName][caracteristic];
            }
        };
        cEnum[i] = cEnum[memberName]; // add reverse lookup
    }
    cEnum.length = members.length;

    cEnum.getClass = function (value) {
        let classId = Math.floor(value);
        return cEnum[classId];
    };

    cEnum.getClassNumber = function (value) {
        return Math.floor(value);
    };

    // iterator para iterar sobre as classes de características
    cEnum[Symbol.iterator] = function* () {
        let classes = members.map(([memberName, _]) => memberName);
        for (const className of classes) {
            yield this[className];
        }
    };

    return Object.freeze(cEnum);
}();

// igual a CARACTERISTIC, mas com outras informações para cada característica
// ex: CARACTERISTICAS.SHAPE.SQUARE.formaAlt == 'Quadrado'
// é feito para ser acessado com CARACTERISTIC, ex: CARACTERISTIC_EXTRA[CARACTERISTIC.SHAPE.SQUARE].formaAlt == 'Quadrado'
const CARACTERISTIC_EXTRA = function () {
    let members = [
        // [ENUM_NAME, ENUM_VALUES]
        ['COLOR', ['BLUE', 'RED', 'YELLOW']],
        ['SHAPE', ['TRIANGLE', 'SQUARE', 'RECTANGLE', 'CIRCLE']],
        ['SIZE', ['BIG', 'SMALL']],
        ['OUTLINE', ['OUTLINED', 'NOTOUTLINED']]
    ];

    // funciona como uma planilha do excel, onde cada coluna é uma caracteristica e cada linha é uma informação da caracteristica
    // subMembers:
    //  formasSrc: componente do caminho das imagens das formas (ex: triângulo azul, pequeno e com contorno -> 'TZPC.svg)
    //  formasAlt: nome da caracteristica para exibição (ex: triângulo azul, pequeno e com contorno -> 'Triângulo azul, pequeno com contorno')
    //  restricaoSrc: componente do caminho das imagens das restrições (ex: restrição peças azuis -> 'azul-sim.svg')
    //  restricaoAlt: nome da restrição para exibição (ex: restrição peças azuis -> 'Podem peças que são azuis')
    let subMembers = [
        //               [   BLUE,         RED,     YELLOW], [    TRIANGLE,      SQUARE,    RECTANGLE,     CIRCLE], [      BIG,      SMALL], [      OUTLINED,    NOTOUTLINED],
        ['formaSrc',     [    'Z',         'V',        'A'], [         'T',         'Q',          'R',        'C'], [      'G',        'P'], [           'C',            'S']],
        ['formaAlt',     [ 'azul',  'vermelho',  'amarelo'], [ 'Triângulo',  'Quadrado',  'Retângulo',  'Círculo'], [ 'grande',  'pequeno'], ['com contorno', 'sem Contorno']],
        ['restricaoSrc', [ 'azul',  'vermelho',  'amarelo'], [ 'triangulo',  'quadrado',  'retangulo',  'circulo'], [ 'grande',  'pequeno'], [    'contorno',  'semContorno']],
        ['restricaoAlt', ['azuis', 'vermelhas', 'amarelas'], ['triângulos', 'quadrados', 'retângulos', 'círculos'], ['grandes', 'pequenas'], ['com contorno', 'sem contorno']],
    ];

    let cEnum = {};

    for (let i = 0; i < members.length; i++) {
        let [memberName, memberValues] = members[i];
        cEnum[memberName] = {};
        for (let j = 0; j < memberValues.length; j++) {
            cEnum[memberName][memberValues[j]] = {};
            for (const subMemberArray of subMembers) {
                let subMemberName = subMemberArray[0];
                // access subMembers, ex CARACTERISTIC_EXTRA.SHAPE.SQUARE.formaSrc
                cEnum[memberName][memberValues[j]][subMemberName] = subMemberArray[(i + 1)][j];
            }
            // lookup with CARACTERISTIC
            cEnum[i + j / memberValues.length] = cEnum[memberName][memberValues[j]];
        }
    }

    // retorna o caminho da imagem de uma forma
    cEnum.getFormaSrc = function (forma) {
        return `../img/fig-rosto/${cEnum[forma.get(CARACTERISTIC.SHAPE)].formaSrc}${cEnum[forma.get(CARACTERISTIC.COLOR)].formaSrc}${cEnum[forma.get(CARACTERISTIC.SIZE)].formaSrc}${cEnum[forma.get(CARACTERISTIC.OUTLINE)].formaSrc}.svg`;
    };

    // retorna o texto da descrição de uma forma
    cEnum.getFormaAlt = function (forma) {
        return `${cEnum[forma.get(CARACTERISTIC.SHAPE)].formaAlt} ${cEnum[forma.get(CARACTERISTIC.COLOR)].formaAlt}, ${cEnum[forma.get(CARACTERISTIC.SIZE)].formaAlt} e ${cEnum[forma.get(CARACTERISTIC.OUTLINE)].formaAlt}.`;
    };

    // retorna o caminho da imagem de uma restrição
    cEnum.getRestricaoScr = function ([regra, aceita]) {
        return `../img/restricoes/${cEnum[regra].restricaoSrc}-${aceita ? 'sim' : 'nao'}.svg`;
    };

    // retorna o texto da descrição de uma restrição
    cEnum.getRestricaoAlt = function ([regra, aceita]) {
        if (CARACTERISTIC.getClass(regra) == CARACTERISTIC.OUTLINE)
            return `${aceita ? 'Só' : 'Não'} podem peças ${cEnum[regra].restricaoAlt}`;
        else
            return `${aceita ? 'Só' : 'Não'} podem peças que são ${cEnum[regra].restricaoAlt}`;
    };

    return Object.freeze(cEnum);
}();

const [ACCEPTED, REJECTED] = [true, false];

const coresEnum = Object.freeze({
    "azul": 0,
    "vermelho": 1,
    "amarelo": 2
});
const formasEnum = Object.freeze({
    "triangulo": 0,
    "quadrado": 1,
    "retangulo": 2,
    "circulo": 3
});
const tamanhoEnum = Object.freeze({
    "grande": 0,
    "pequeno": 1
});
const contornoEnum = Object.freeze({
    "comContorno": 0,
    "semContorno": 1
});

function getFasesPorAno() {
    switch (ano) {
        case "Primeiro ano":
            etapaMax = 40;
            break;
        case "Segundo ano":
            etapaMax = 40;
            break;
        case "Terceiro ano":
            etapaMax = 40;
            break;
        case "Quarto ano":
            etapaMax = 40;
            break;
        case "Quinto ano":
            etapaMax = 40;
            break;
        case "Sexto ano":
            etapaMax = 40;
            break;
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
    removeChildElementsByTag(dropEsquerdoId, 'img');
    removeChildElementsByTag(dropIntersecaoId, 'img');
    removeChildElementsByTag(dropDireitoId, 'img');

    //Array contendo todos os elementos gerados
    restricao1 = [];
    restricao2 = [];
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

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNormalRandomIntInclusive(min, max) {
    const sample_size = 10;
    let random = 0;
    for (let i = 0; i < sample_size; i++) {
        random += Math.random();
    }
    random /= sample_size;

    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(random * (max - min + 1)) + min;
}

function getImgAlt(img) {
    var alt = '';

    switch (parseInt(img.getAttribute('data-tipo'))) {
        case formasEnum.triangulo:
            alt += 'Triângulo';
            break;
        case formasEnum.retangulo:
            alt += 'Retângulo';
            break;
        case formasEnum.circulo:
            alt += 'Círculo';
            break;
        case formasEnum.quadrado:
            alt += 'Quadrado';
            break;
    }

    switch (parseInt(img.getAttribute('data-cor'))) {
        case coresEnum.azul:
            alt += ' azul';
            break;
        case coresEnum.amarelo:
            alt += ' amarelo';
            break;
        case coresEnum.vermelho:
            alt += ' vermelho';
            break;
    }

    switch (parseInt(img.getAttribute('data-tam'))) {
        case tamanhoEnum.grande:
            alt += ', grande';
            break;
        case tamanhoEnum.pequeno:
            alt += ', pequeno';
            break;
    }

    switch (parseInt(img.getAttribute('data-cont'))) {
        case contornoEnum.comContorno:
            alt += ' e com contorno';
            break;
        case contornoEnum.semContorno:
            alt += ' e sem contorno';
            break;
    }

    alt += '.';

    return alt;
}

function repetida(imgGerada, arrayImg) {
    let flag = 0;
    let aux;

    arrayImg.forEach(el => {
        if (el.getAttribute('data-tipo') == imgGerada.getAttribute('data-tipo')) {
            flag++;
        }
        if (el.getAttribute('data-cor') == imgGerada.getAttribute('data-cor')) {
            flag++;
        }
        if (el.getAttribute('data-tam') == imgGerada.getAttribute('data-tam')) {
            flag++;
        }
        if (el.getAttribute('data-cont') == imgGerada.getAttribute('data-cont')) {
            flag++;
        }

        if (flag == 4) {
            console.log("FLAGGGG");
            console.log(flag);
            aux = 1;
        }
        flag = 0;
    });

    if (aux == 1) {
        return 1;
    }
    else {
        return 0;
    }
}

function getRestrictScr(estado, classificação, valor) {   //Cria a src a partir dos valores dos atributos
    var src = '';
    var srcAlt = '';
    var alt = '';
    var novaImg = document.createElement("img");

    if (estado == 'Negado') {
        srcAlt += 'Não podem peças que ';
    }
    else {
        srcAlt += 'Podem peças que ';
    }

    switch (classificação) {

        case forma:
            switch (valor) {
                case formasEnum.triangulo:
                    alt += 'triangulo';
                    srcAlt += 'são triângulos';
                    break;
                case formasEnum.retangulo:
                    alt += 'retangulo';
                    srcAlt += 'são retângulos';
                    break;
                case formasEnum.circulo:
                    alt += 'circulo';
                    srcAlt += 'são círculos';
                    break;
                case formasEnum.quadrado:
                    alt += 'quadrado';
                    srcAlt += 'são quadrados';
                    break;
            }
            break;

        case cor:
            switch (valor) {
                case coresEnum.azul:
                    alt += 'azul';
                    srcAlt += 'são azuis';
                    break;
                case coresEnum.amarelo:
                    alt += 'amarelo';
                    srcAlt += 'são amarelas';
                    break;
                case coresEnum.vermelho:
                    alt += 'vermelho';
                    srcAlt += 'são vermelhas';
                    break;
            }
            break;

        case tamanho:
            switch (valor) {
                case tamanhoEnum.grande:
                    alt += 'grande';
                    srcAlt += 'são grandes';
                    break;
                case tamanhoEnum.pequeno:
                    alt += 'pequeno';
                    srcAlt += 'são pequenas';
                    break;
            }
            break;

        case contorno:
            switch (valor) {
                case contornoEnum.comContorno:
                    alt += 'contorno';
                    srcAlt += 'tem contorno';
                    break;
                case contornoEnum.semContorno:
                    alt += 'semContorno';
                    srcAlt += 'não tem contorno';
                    break;
            }
            break;

    }

    if (estado == 'Negado') {
        alt += '-nao';
    }
    else {
        alt += '-sim';
    }

    src += '../img/restricoes/' + alt + '.svg';
    novaImg.setAttribute('src', src);
    novaImg.setAttribute('alt', srcAlt);
    novaImg.setAttribute('title', srcAlt);


    return novaImg;
}

function getImgScr(forma, cor, tamanho, contorno) {   //Cria a src a partir dos valores dos atributos
    var src = '../img/fig-rosto/';

    switch (forma) {
        case formasEnum.triangulo:
            src += 'T';
            break;
        case formasEnum.retangulo:
            src += 'R';
            break;
        case formasEnum.circulo:
            src += 'C';
            break;
        case formasEnum.quadrado:
            src += 'Q';
            break;
    }

    switch (cor) {
        case coresEnum.azul:
            src += 'Z';
            break;
        case coresEnum.amarelo:
            src += 'A';
            break;
        case coresEnum.vermelho:
            src += 'V';
            break;
    }

    switch (tamanho) {
        case tamanhoEnum.grande:
            src += 'G';
            break;
        case tamanhoEnum.pequeno:
            src += 'P';
            break;
    }

    switch (contorno) {
        case contornoEnum.comContorno:
            src += 'C';
            break;
        case contornoEnum.semContorno:
            src += 'S';
            break;
    }

    src += '.svg';

    return src;
}

function imgRestricao(quantCor, quantTipo, quantTam, quantCont) {

    var novaImg = document.createElement("img");
    var arq, tipo, tam, cor, cont;

    /*Adiciona as características priorizando as restrições*/
    if (restricao1[forma] != null) {
        if (estadoRestricao1[forma] == 'Aceito') {
            novaImg.setAttribute('data-tipo', restricao1[forma]);
            tipo = restricao1[forma];
        }
        else {
            do {
                tipo = getRandomIntInclusive(0, 3);
            } while (tipo == restricao1[forma] && tipo == restricao2[forma]);
            novaImg.setAttribute('data-tipo', tipo);
        }

    } else {
        if (restricao2[forma] != null && quantTipo == 1) {
            if (estadoRestricao2[forma] == 'Aceito') {
                novaImg.setAttribute('data-tipo', restricao2[forma]);
                tipo = restricao2[forma];
            }
            else {
                do {
                    tipo = getRandomIntInclusive(0, 3);
                } while (tipo == restricao2[forma]);
                novaImg.setAttribute('data-tipo', tipo);
            }

        } else {
            do {
                tipo = getRandomIntInclusive(0, 3);
            } while (restricao2[forma] != null && tipo == restricao2[forma]);
            novaImg.setAttribute('data-tipo', tipo);
        }

    }

    if (restricao1[1] != null) {
        if (estadoRestricao1[1] == 'Aceito') {
            novaImg.setAttribute('data-cor', restricao1[1]);
            cor = restricao1[1];
        }
        else {
            do {
                cor = getRandomIntInclusive(0, 2);
            } while (cor == restricao1[1]);
            novaImg.setAttribute('data-cor', cor);
        }

    } else {
        if (restricao2[1] != null && quantCor == 1) {
            if (estadoRestricao2[1] == 'Aceito') {
                novaImg.setAttribute('data-cor', restricao2[1]);
                cor = restricao2[1];
            }
            else {
                do {
                    cor = getRandomIntInclusive(0, 2);
                } while (cor == restricao2[1]);
                novaImg.setAttribute('data-cor', cor);
            }

        } else {
            do {
                cor = getRandomIntInclusive(0, 2);
            } while (restricao2[1] != null && cor == restricao2[1]);
            novaImg.setAttribute('data-cor', cor);
        }
    }

    if (restricao1[tamanho] != null) {
        if (estadoRestricao1[tamanho] == 'Aceito') {
            novaImg.setAttribute('data-tam', restricao1[tamanho]);
            tam = restricao1[tamanho];
        }
        else {
            do {
                tam = getRandomIntInclusive(0, 1);
            } while (tam == restricao1[tamanho]);
            novaImg.setAttribute('data-tam', tam);
        }

    } else {
        if (restricao2[tamanho] != null && quantTam == 1) {
            if (estadoRestricao2[tamanho] == 'Aceito') {
                novaImg.setAttribute('data-tam', restricao2[tamanho]);
                tam = restricao2[tamanho];
            }
            else {
                do {
                    tam = getRandomIntInclusive(0, 1);
                } while (tam == restricao2[tamanho]);
                novaImg.setAttribute('data-tam', tam);
            }

        } else {
            do {
                tam = getRandomIntInclusive(0, 1);
            } while (restricao2[tamanho] != null && tam == restricao2[tamanho]);
            novaImg.setAttribute('data-tam', tam);
        }

    }

    if (restricao1[contorno] != null) {
        if (estadoRestricao1[contorno] == 'Aceito') {
            novaImg.setAttribute('data-cont', restricao1[contorno]);
            cont = restricao1[contorno];
        }
        else {
            do {
                cont = getRandomIntInclusive(0, 1);
            } while (cont == restricao1[contorno]);
            novaImg.setAttribute('data-cont', cont);
        }

    } else {
        if (restricao2[contorno] != null && quantCont == 1) {
            if (estadoRestricao2[contorno] == 'Aceito') {
                novaImg.setAttribute('data-cont', restricao2[contorno]);
                cont = restricao2[contorno];
            }
            else {
                do {
                    cont = getRandomIntInclusive(0, 1);
                } while (cont == restricao2[contorno]);
                novaImg.setAttribute('data-cont', cont);
            }

        } else {
            do {
                cont = getRandomIntInclusive(0, 1);
            } while (restricao2[contorno] != null && cont == restricao2[contorno]);
            novaImg.setAttribute('data-cont', cont);
        }

    }

    arq = getImgScr(tipo, cor, tam, cont);
    novaImg.setAttribute('src', arq);
    novaImg.classList.add('drag');
    console.log("PRIMEIRA IMG");
    console.log('novaimg: tipo=' + tipo + ', cor=' + cor + ', tam=' + tam + ', contorno=' + cont + ', src=' + arq);
    novaImg.setAttribute('alt', getImgAlt(novaImg));
    novaImg.setAttribute('title', novaImg.getAttribute('alt'));
    novaImg.classList.add('game-img');
    tam == 1 ? novaImg.classList.add('pequeno') : novaImg.classList.add('grande');

    return novaImg;

}

function novaImgBlocoLogicoComRestricoes(arrayPecasExistentes, maxCores, maxFormas, maxTamanhos, maxContornos, parametro, quantidade) {
    var novaImg = document.createElement("img");
    var i, cor, tipo, tam, cont, arq;
    var corUsada = [0, 0, 0],
        formaUsada = [0, 0, 0, 0],
        tamanhoUsado = [0, 0],
        contornoUsado = [0, 0];
    var coresUsadas = 0,
        formasUsadas = 0,
        tamanhosUsados = 0,
        contornosUsados = 0;

    if (arrayPecasExistentes.length != 0) {
        /*preencher caracteristicas já usadas*/
        console.log('verificar caracteristicas usadas');
        for (i = 0; i < arrayPecasExistentes.length; i++) {
            if (arrayPecasExistentes[i] == null)
                continue;
            coresUsadas += corUsada[arrayPecasExistentes[i].getAttribute('data-cor')] == 1 ? 0 : 1;
            corUsada[arrayPecasExistentes[i].getAttribute('data-cor')] = 1;
            formasUsadas += formaUsada[arrayPecasExistentes[i].getAttribute('data-tipo')] == 1 ? 0 : 1;
            formaUsada[arrayPecasExistentes[i].getAttribute('data-tipo')] = 1;
            tamanhosUsados += tamanhoUsado[arrayPecasExistentes[i].getAttribute('data-tam')] == 1 ? 0 : 1;
            tamanhoUsado[arrayPecasExistentes[i].getAttribute('data-tam')] = 1;
            contornosUsados += contornoUsado[arrayPecasExistentes[i].getAttribute('data-cont')] == 1 ? 0 : 1;
            contornoUsado[arrayPecasExistentes[i].getAttribute('data-cont')] = 1;
            console.log('peca verificada');
        }

        //escolher cor
        console.log('cores usadas = ' + coresUsadas);
        for (i = 0; i < corUsada.length; i++) {
            console.log(i + ' = ' + corUsada[i]);
        }
        while (1) {
            cor = getRandomIntInclusive(0, 2);
            if (coresUsadas < maxCores && !corUsada[cor]) {
                //se ainda nao escolheu todas as cores e eh  uma nova cor
                break;
            }
            if (coresUsadas >= maxCores && corUsada[cor]) {
                //se ja escolheu todas as cores e eh cor ja usada
                break;
            }
        }
        //escolher forma
        console.log('escolher nova forma');
        while (1) {
            tipo = getRandomIntInclusive(0, 3);
            if (formasUsadas < maxFormas && !formaUsada[tipo]) {
                break;
            }
            if (formasUsadas >= maxFormas && formaUsada[tipo]) {
                break;
            }
        }
        //escolher tamanho
        console.log('escolher novo tamanho');
        while (1) {
            tam = getRandomIntInclusive(0, 1);
            console.log('tam escolhido = ' + tam + ' tamanhoUsado = ' + tamanhoUsado);
            if (tamanhosUsados < maxTamanhos && !tamanhoUsado[tam]) {
                break;
            }
            if (tamanhosUsados >= maxTamanhos && tamanhoUsado[tam]) {
                break;
            }
        }
        //escolher contorno
        console.log('escolher novo contorno');
        while (1) {
            cont = getRandomIntInclusive(0, 1);
            if (contornosUsados < maxContornos && !contornoUsado[cont]) {
                break;
            }
            if (contornosUsados >= maxContornos && contornoUsado[cont]) {
                break;
            }
        }
    } else {
        //array vazio
        console.log('array de imgs estava vazio');
        cor = getRandomIntInclusive(0, 2);
        tipo = getRandomIntInclusive(0, 3);
        tam = getRandomIntInclusive(0, 1);
        cont = getRandomIntInclusive(0, 1);
    }

    if (parametro == 2 && quantidade != 0) {

        if (restricao2[0] != null) {
            tipo = restricao2[0];
        }
        else {
            while (restricao1[0] != null && tipo == restricao1[0]) {
                tipo = getRandomIntInclusive(0, 3);
            }
        }

        if (restricao2[1] != null) {
            cor = restricao2[1];
        }
        else {
            while (restricao1[1] != null && cor == restricao1[1]) {
                cor = getRandomIntInclusive(0, 2);
            }
        }

        if (restricao2[2] != null) {
            tam = restricao2[2];
        }
        else {
            while (restricao1[2] != null && tam == restricao1[2]) {
                tam = getRandomIntInclusive(0, 1);
            }
        }

        if (restricao2[3] != null) {
            cont = restricao2[3];
        }
        else {
            while (restricao1[3] != null && cont == restricao1[3]) {
                cont = getRandomIntInclusive(0, 1);
            }
        }

    }

    if (parametro == 3 && quantidade == 3) {
        if (restricao2[0] != null) {
            tipo = restricao2[0];
        }
        else {
            if (restricao1[0] != null) {
                tipo = restricao1[0];
            }
        }

        if (restricao2[1] != null) {
            cor = restricao2[1];
        }
        else {
            if (restricao1[1] != null) {
                cor = restricao1[1];
            }
        }

        if (restricao2[2] != null) {
            tam = restricao2[2];
        }
        else {
            if (restricao1[2] != null) {
                tam = restricao1[2];
            }
        }

        if (restricao2[3] != null) {
            cont = restricao2[3];
        }
        else {
            if (restricao1[3] != null) {
                cont = restricao1[3];
            }
        }
    }

    arq = getImgScr(tipo, cor, tam, cont);
    novaImg.setAttribute('src', arq);
    novaImg.setAttribute('data-cor', cor);
    novaImg.setAttribute('data-tipo', tipo);
    novaImg.setAttribute('data-tam', tam);
    novaImg.setAttribute('data-cont', cont);
    novaImg.classList.add('drag');
    novaImg.setAttribute('alt', getImgAlt(novaImg));
    novaImg.setAttribute('title', novaImg.getAttribute('alt'));
    novaImg.classList.add('game-img');
    tam == 1 ? novaImg.classList.add('pequeno') : novaImg.classList.add('grande');


    console.log('novaimg: tipo=' + tipo + ', cor=' + cor + ', tam=' + tam + ', contorno=' + cont + ', src=' + arq);

    return novaImg;
}

function conferir(numero, completo) {   //Confere se o número já foi utilizado 

    var flagTest = 0;

    completo.forEach(el => {
        if (el == numero) {
            flagTest = 1;
        }
    });

    return flagTest;

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

function shuffleArray(array) {
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Gera o produto cartesiano dos iteráveis dados
 * (https://stackoverflow.com/a/44012184)
 * @param {Iterable} head primeiro iterável
 * @param  {...Iterable} tail outros iteráveis
 */
function* cartesianProduct(head, ...tail) {
    const remainder = tail.length > 0 ? cartesianProduct(...tail) : [[]];
    for (let r of remainder) for (let h of head) yield [h, ...r];
}

/**
 * Gera as formas para uma caixa, gerando uma forma para cada conjunto em restrictionSets
 * @param {RestrictionSetContainer[]} restrictionSets Array de conjuntos simples (uma característica por classe)
 * @returns {Map<Object, Number>[]} Array contendo as peças geradas para essa caixa (formato Map([[CLASSE_CARACTERISTICA, CARACTERISTICA], ...]))
 */
function gerarFormas(restrictionSets) {
    'use strict';

    let caixaItems = [];

    for (const set of restrictionSets) {
        let piece = new Map();
        for (const classe of [...CARACTERISTIC])
            piece.set(classe, [...set.get(classe)][0]);
        caixaItems.push(piece);
    }

    return caixaItems;
}

/**
 * Faz a operação zip em dois arrays
 * @param {any[]} arr1
 * @param {any[]} arr2 
 * @returns {any[][]} Array de arrays, onde cada array é um par de elementos de arr1 e arr2
 */
function zipArr(arr1, arr2) {
    return arr1.map((k, i) => [k, arr2[i]]);
}

// src: https://stackoverflow.com/a/19270021
// it's a partial fisher-yates shuffle
/**
 * Escolhe aleatoriamente n elementos de um array. O array original não é modificado. Lança um erro se n > array.length
 * @param {any[]} arr 
 * @param {Integer} n 
 * @returns {any[]} Array com n elementos aleatórios de arr
 */
function pickRandom(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

/**
 * Gera um número aleatório seguindo uma distribuição quase normal
 * @returns {Number} Número em (0,1]
 */
function randomNormalDistr() {
    const sampleSize = 10;
    let random = 0;
    for (let i = 0; i < sampleSize; i++)
        random += Math.random();
    random /= sampleSize;

    return random;
}

// Constantes de definição de tipo de rejeição
const ONE_SIDE = { // rejeições somente em uma caixa
    NO_ACCEPTED: 0,
    WITH_ACCEPTED: 1 // característica aceita da mesma classe na outra caixa
};
const BOTH_SIDES = 2; // ambas as caixas possuem as rejeições

/**
 * CaracteristicContainer é uma estrutura de dados que armazena as características
 * indexando por classe, possibilitando obter as características de uma classe sem
 * muito trabalho
 */
function CaracteristicContainer() {
    if (!new.target)
        return new CaracteristicContainer();

    // the array of the map
    this.arr = Array.from(Array(CARACTERISTIC.length), () => []);
}

/**
 * Insere característica da classe classe no container
 * @param {CARACTERISTIC[*]} classe 
 * @param  {...CARACTERISTIC[*][*]} caracteristicas 
 */
CaracteristicContainer.prototype.insert = function (classe, ...caracteristicas) {
    this.arr[classe.id].push(...caracteristicas);
};

/**
 * Retorna as características no container.
 * Method Overload:
 * - get(classe) -> retorna todas as características da classe
 * - get() -> retorna todas as características de todas as classes, num array de uma dimensão
 * @param {CARACTERISTIC[*]} classe 
 * @returns {CARACTERISTIC[*][*][]} Array com as características
 */
CaracteristicContainer.prototype.get = function (classe) {
    if (!classe)
        return this.arr.flat();

    return this.arr[classe.id];
};

/**
 * Concatena dois containers, retornando um novo container. Pode haver caracteristicas repetidas no novo container
 * @param {CaracteristicContainer} other O outro container para concatenar
 * @returns {CaracteristicContainer} Novo array com as características de this e other
 */
CaracteristicContainer.prototype.concat = function (other) {
    let newRestrictions = new CaracteristicContainer();
    for (let i = 0; i < this.arr.length; i++) 
        newRestrictions.arr[i] = this.arr[i].concat(other.arr[i]);
    
    return newRestrictions;
};

/**
 * CaracteristicSetContainer é um CaracteristicContainer, mas que armazena as características
 * em um Set, oferecendo operações com conjuntos e remoção de duplicatas
 */
function CaracteristicSetContainer() {
    if (!new.target) 
        // TODO: make it throw
        return new CaracteristicSetContainer();
    
    // the array of the map
    this.arr = Array.from(Array(CARACTERISTIC.length), () => new Set());
}

/**
 * Insere característica da classe classe no set. Retorna this
 * @param {CARACTERISTIC[*]} classe 
 * @param  {...CARACTERISTIC[*][*]} caracteristicas 
 * @returns {CaracteristicSetContainer} this
 */
CaracteristicSetContainer.prototype.add = function (classe, ...caracteristicas) {
    caracteristicas.forEach(caracteristica => this.arr[classe.id].add(caracteristica));
    return this;
};

/**
 * Deifine as características de uma classe no container, sobrescrevendo as caracteristicas antigas. Retorna this
 * @param {CARACTERISTIC[*]} classe 
 * @param  {...CARACTERISTIC[*][*]} caracteristicas 
 * @returns {CaracteristicSetContainer} this
 */
CaracteristicSetContainer.prototype.set = function (classe, ...caracteristicas) {
    this.arr[classe.id] = new Set(caracteristicas);
    return this;
};

/**
 * Retorna as características no container.
 * Method Overload:
 * - get(classe) -> retorna todas as características da classe
 * - get() -> retorna todas as características de todas as classes, num Set
 * @param {CARACTERISTIC[*]} classe 
 * @returns {Set<CARACTERISTIC[*][*]>} Set com as características
 */
CaracteristicSetContainer.prototype.get = function (classe) {
    if (!classe) 
        return new Set(this.arr.flatMap(set => [...set]));
    
    return new Set([...this.arr[classe.id]]);
};

// TODO: make "virtual" versions of set ops. These make the ops with the empty classes (empty arr entries) as they were full (like invert() were applied to them)

/**
 * Retornar um novo CaracteristicSetContainer contendo a interseção de this e other.
 * Method Overload:
 * - intersect(other) -> retorna a interseção de this e other
 * - intersect(classe, other) -> retorna a interseção de this e other na classe `classe`, com as outras classes sendo igual a this
 * @param {CaracteristicSetContainer} other 
 * @param {CARACTERISTIC[*]} classe 
 * @returns {CaracteristicSetContainer} Novo CaracteristicSetContainer com a interseção
 */
CaracteristicSetContainer.prototype.intersection = function (other, classe) {
    let newSet = new CaracteristicSetContainer();

    // if a class is given, intersect only that class
    if (typeof classe !== 'undefined') {
        for (let i = 0; i < this.arr.length; i++) {
            if (i === classe.id) {
                for (const r of other.arr[i]) {
                    if (this.arr[i].has(r)) 
                        newSet.arr[i].add(r);
                }
            } else {
                newSet.arr[i] = new Set(this.arr[i]);
            }
        }
    }

    // if class is not given, intersect all classes
    for (let i = 0; i < this.arr.length; i++) {
        for (const r of other.arr[i]) {
            if (this.arr[i].has(r)) 
                newSet.arr[i].add(r);
        }
    }

    return newSet;
};

/**
 * Retornar um novo CaracteristicSetContainer contendo a união de this e other.
 * Method Overload:
 * - union(other) -> retorna a união de this e other
 * - union(classe, other) -> retorna a união de this e other na classe `classe`, com as outras classes sendo igual a this
 * @param {CaracteristicSetContainer} other 
 * @param {CARACTERISTIC[*]} classe 
 * @returns {CaracteristicSetContainer} Novo CaracteristicSetContainer com a união
 */
CaracteristicSetContainer.prototype.union = function (other, classe) {
    let newSet = new CaracteristicSetContainer();

    // if a class is given, union only that class
    if (typeof classe !== 'undefined') {
        for (let i = 0; i < this.arr.length; i++) {
            if (i === classe.id) {
                for (const r of other.arr[i]) 
                    newSet.arr[i].add(r);
                
                for (const r of this.arr[i]) 
                    newSet.arr[i].add(r);
            } else {
                newSet.arr[i] = new Set(this.arr[i]);
            }
        }
    }

    // if class is not given, union all classes
    for (let i = 0; i < this.arr.length; i++) {
        for (const r of other.arr[i]) 
            newSet.arr[i].add(r);
        
        for (const r of this.arr[i]) 
            newSet.arr[i].add(r);
    }

    return newSet;
};

/**
 * Retornar um novo CaracteristicSetContainer contendo a diferença de this e other.
 * Method Overload:
 * - difference(other) -> retorna a diferença de this e other
 * - difference(classe, other) -> retorna a diferença de this e other na classe `classe`, com as outras classes sendo igual a this
 * @param {CaracteristicSetContainer} other
 * @param {CARACTERISTIC[*]} classe
 * @returns {CaracteristicSetContainer} Novo CaracteristicSetContainer com a diferença
 */
CaracteristicSetContainer.prototype.difference = function (other, classe) {
    let newSet = new CaracteristicSetContainer();

    // if a class is given, subtract only that class
    if (typeof classe !== 'undefined') {
        for (let i = 0; i < this.arr.length; i++) {
            if (i === classe.id) {
                for (const r of this.arr[i]) {
                    if (!other.arr[i].has(r)) 
                        newSet.arr[i].add(r);
                }
            } else {
                newSet.arr[i] = new Set(this.arr[i]);
            }
        }
    }

    // if class is not given, subtract all classes
    for (let i = 0; i < this.arr.length; i++) {
        for (const r of this.arr[i]) {
            if (!other.arr[i].has(r)) 
                newSet.arr[i].add(r);
        }
    }

    return newSet;
};

/**
 * Retornar se this é um subconjunto de other.
 * Method Overload:
 * - isSubsetOf(other) -> retorna se this é um subconjunto de other
 * - isSubsetOf(classe, other) -> retorna se this[classe] é um subconjunto de other[classe]
 * @param {CaracteristicSetContainer} other
 * @param {CARACTERISTIC[*]} classe
 * @returns {boolean} Se this é um subconjunto de other
 */
CaracteristicSetContainer.prototype.isSubsetOf = function (other, classe) {
    // if a class is given, check only that class
    if (typeof classe !== 'undefined') {
        for (const r of this.arr[classe.id]) {
            if (!other.arr[classe.id].has(r))
                return false;
        }
        return true;
    }

    // if class is not given, check all classes
    for (let i = 0; i < this.arr.length; i++) {
        for (const r of this.arr[i]) {
            if (!other.arr[i].has(r)) 
                return false;
        }
    }

    return true;
};

/**
 * Retornar se this é igual a other.
 * Method Overload:
 * - isEqualTo(other) -> retorna se this é igual a other
 * - isEqualTo(classe, other) -> retorna se this[classe] é igual a other[classe]
 * @param {CaracteristicSetContainer} other
 * @param {CARACTERISTIC[*]} classe
 * @returns {boolean} Se this é igual a other
 */
CaracteristicSetContainer.prototype.equals = function (other, classe) {
    // if a class is given, check only that class
    if (typeof classe !== 'undefined') {
        return this.arr[classe.id].size === other.arr[classe.id].size &&
            this.isSubsetOf(other, classe);
    }

    // if class is not given, check all classes
    for (let i = 0; i < this.arr.length; i++) {
        if (this.arr[i].size !== other.arr[i].size) 
            return false;
    }

    return this.isSubsetOf(other);
};

/**
 * Retorna se há uma classe vazia, ou seja, se não há nenhuma característica de uma classe no container.
 * Exemplo: se não há nenhuma característica de classe CARACTERISTIC.COR no container, retorna true.
 * @returns {boolean} Se há uma classe vazia
 */
CaracteristicSetContainer.prototype.anyEmpty = function () {
    for (let i = 0; i < this.arr.length; i++) {
        if (this.arr[i].size === 0) 
            return true;
    }

    return false;
};

/**
 * Inverte o container, retornando um novo conjunto contendo as características que não estão no container.
 * Method Overload:
 * - invert() -> inverte todo o container
 * - invert(classe) -> inverte somente a classe
 * @param {*} classe 
 * @returns {CaracteristicSetContainer} Novo CaracteristicSetContainer com o inverso de this
 */
CaracteristicSetContainer.prototype.invert = function (classe) {
    let newSet = new CaracteristicSetContainer();

    // if a class is given, invert only that class
    if (typeof classe !== 'undefined') {
        newSet.arr = this.arr.map((set) => new Set(set));
        let allCaracteristics = [...CARACTERISTIC[classe.id]];
        newSet.arr[classe.id] = new Set(allCaracteristics.filter((x) => !this.arr[classe.id].has(x)));
        return newSet;
    }

    // if class is not given, invert all classes
    for (const classe of [...CARACTERISTIC]) {
        let allCaracteristics = [...CARACTERISTIC[classe.id]];
        newSet.arr[classe.id] = new Set(allCaracteristics.filter((x) => !this.arr[classe.id].has(x)));
    }

    return newSet;
};

/**
 * Retorna uma cópia do container.
 * @returns {CaracteristicSetContainer} Cópia do container
 */
CaracteristicSetContainer.prototype.clone = function () {
    let newSet = new CaracteristicSetContainer();
    newSet.arr = this.arr.map((set) => new Set(set));
    return newSet;
};

/**
 * Retorna um array com todos os subconjuntos contendo uma caracteristica de por classe.
 * @param {*} classe 
 * @returns 
 */
CaracteristicSetContainer.prototype.toSingleSubsets = function (classe) {
    let subsets = [];

    // if a class is given, get all subsets only that class
    if (typeof classe !== 'undefined') {
        for (const r of this.arr[classe.id]) {
            let newSet = this.clone();
            newSet.arr[classe.id] = new Set([r]);
            subsets.push(newSet);
        }
    }

    // if class is not given, get all subsets all classes
    for (const comb of cartesianProduct(...this.arr)) {
        let newSet = new CaracteristicSetContainer();
        newSet.arr = comb.map(cateristica => new Set([cateristica]));
        subsets.push(newSet);
    }

    return subsets;
};

/**
 * Preprocessa e converte uma especificação de nível de entrada em uma saída padronizada
   input:
   {
       restrictionClasses: [
         //[              class, accepted?, rejQty, rejectionMode]
           [CARACTERISTIC.SHAPE,     true],
           [CARACTERISTIC.COLOR,     false,      2,    BOTH_SIDES]
       ],
       maxNumAnswers: 7,
       maxNumShapes: 12,
       // for non specified classes, the limit is 1
       randomLimits: [
         //[             class, max]
           [CARACTERISTIC.SIZE,   2]
       ]
   }

   output:
   {
       acceptedClasses: [CARACTERISTIC.SHAPE, ...],
       rejectedClasses: {
           // mode: [[class, qty], ...] 
           ONE_SIDE.NO_ACCEPTED: [[CARACTERISTIC.SIZE, 1], ...],
           ONE_SIDE.WITH_ACCEPTED: [[c, n], ...],
           BOTH_SIDES: [[CARACTERISTIC.COLOR, 2], ...]
       }
       maxNumAnswers: 7,
       maxNumShapes: 12,
       randomLimits : new Map([
                              [CARACTERISTIC.SHAPE, 1],
                              [CARACTERISTIC.COLOR, 1],
                              [CARACTERISTIC.SIZE, 2],
                              [CARACTERISTIC.OUTLINE, 1]
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

    let classesUso = new Map([...CARACTERISTIC].map(classe => [classe, false]));
    for (let [caracteristicClass, accepted, rejQty, rejectionMode] of input.restrictionClasses) {
        if (classesUso.get(caracteristicClass)) {
            console.warn('Ignorando classe de restrição repetida: ', caracteristicClass);
            continue;
        }
        classesUso.set(caracteristicClass, true);
        
        // checa se a classe é válida
        if (![...CARACTERISTIC].includes(caracteristicClass)) {
            console.error('Classe de restrição inválida: ', caracteristicClass, '\nIgnorando.');
            continue;
        }

        if (!accepted) {
            // checa se a quantidade de rejeição é válida
            if (!Number.isInteger(rejQty) || rejQty <= 0) {
                console.error('Classe de restrição com quantidade de rejeição inválida: ', caracteristicClass, '\nIgnorando.');
                continue;
            }
            // checa se rejectionMode é válido
            if (rejectionMode !== ONE_SIDE.NO_ACCEPTED && rejectionMode !== ONE_SIDE.WITH_ACCEPTED && rejectionMode !== BOTH_SIDES) {
                console.error('Modo de rejeição inválido para classe: ', caracteristicClass, rejectionMode, '\nIgnorando.');
                continue;
            }

            if (rejQty > caracteristicClass.length) {
                console.error('Quantidade de rejeição maior que o número de características da classe: ', caracteristicClass, '\nUsando o máximo possível.');
                rejQty = caracteristicClass.length;
            }
            // correções sobre ONE_SIDE.WITH_ACCEPTED. Não se pode usar todas as características da classe, pois essa situação é equivalente
            // a ter a mesma característica aceita em ambas as caixas.
            // Ex: [SQUARE, CIRCLE, TRIANGLE] rejeitadas e [RECTANGLE] aceita == [RECTANGLE] aceita e [RECTANGLE] aceita.

            // classes com menos de 3 características não podem ser ONE_SIDE.WITH_ACCEPTED, pois length([aceita, rejeita]) == length(classe)
            if (rejectionMode === ONE_SIDE.WITH_ACCEPTED && caracteristicClass.length < 3) {
                console.error('Modo de rejeição ONE_SIDE.WITH_ACCEPTED não pode ser usado para classes com menos de 3 características: ', caracteristicClass, '\nUsando ONE_SIDE.NO_ACCEPTED.');
                rejectionMode = ONE_SIDE.NO_ACCEPTED;
            }
            // Não permitir que todas as características de uma classe sejam usadas no ONE_SIDE.WITH_ACCEPTED,
            if (rejectionMode === ONE_SIDE.WITH_ACCEPTED && rejQty > caracteristicClass.length - 2) {
                console.error('Quantidade de rejeição muito alto para ONE_SIDE.WITH_ACCEPTED (> classe.length - 2) da classe: ', caracteristicClass, '\nUsando o máximo possível.');
                rejQty = caracteristicClass.length - 2; // evita a situação equivalente a ter a mesma característica aceita em ambos os lados
            }


            if (rejectionMode === BOTH_SIDES && rejQty < 2) {
                console.error('Modo de rejeição BOTH_SIDES requer pelo menos 2 características rejeitadas: ' + caracteristicClass, '\nUsando 2.');
                rejQty = 2;
            }
        }
        restrictionClasses.push([caracteristicClass, accepted, rejQty, rejectionMode]);
    }

    for (let [caracteristicClass, accepted, rejQty, rejectionMode] of restrictionClasses) {
        if (accepted)
            acceptedClasses.push(caracteristicClass);
        else
            rejectedClasses[rejectionMode].push([caracteristicClass, rejQty]);
    }

    // se a classe não foi especificada em randomParameters, limitar a 1 característica
    let randomLimits = new Map([...CARACTERISTIC].map(classe => [classe, 1]));
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
        maxNumShapes: input.maxNumShapes,
        randomLimits: randomLimits
    };
}

// TODO: is this useful?
function CaracteristicSet(shapes) {
    if (!new.target) 
        return new CaracteristicSet();
    

    const [REJECTED, ACCEPTED] = [false, true];
    let todasCaracteristicas = [...CARACTERISTIC].flatMap(classe => [...classe]);
    let caracteristicasIndex = function() {
        let obj = Object.create(null);
        todasCaracteristicas.forEach((el, i) => obj[el] = i);
    }();

    if (!shapes) {
        this.arr = Array(CARACTERISTIC.length).fill(0);
    } else {
        this.arr = Array(CARACTERISTIC.length).fill(1 << REJECTED);
        shapes.forEach(shape => shape.forEach(caracteristic => {
            let i = caracteristicasIndex[caracteristic];
            this.arr[i] = 1 << ACCEPTED;
        }));
    }

    this.add = function (caracteristic, accepted) {
        let i = caracteristicasIndex[caracteristic];
        this.arr[i] |= 1 << accepted;
        return this;
    };

    this.set = function (caracteristic, accepted) {
        let i = caracteristicasIndex[caracteristic];
        this.arr[i] = 1 << accepted;
        return this;
    };

    this.remove = function (caracteristic, accepted) {
        let i = this.caracteristicasIndex[caracteristic];
        this.arr[i] &= ~(1 << accepted);
        return this;
    };

    this.clear = function (caracteristic) {
        let i = caracteristicasIndex[caracteristic];
        this.arr[i] = 0;
        return this;
    };

    this.intersection = function (otherSet) {
        let newSet = new CaracteristicSet();

        for (let i = 0; i < CARACTERISTIC.length; i++) 
            newSet.arr = this.arr[i] & otherSet.arr[i];
        
        return newSet;
    };

    this.union = function (otherSet) {
        let newSet = new CaracteristicSet();

        for (let i = 0; i < CARACTERISTIC.length; i++) 
            newSet.arr = this.arr[i] | otherSet.arr[i];
        
        return newSet;
    };

    this.difference = function (otherSet) {
        let newSet = new CaracteristicSet();

        for (let i = 0; i < CARACTERISTIC.length; i++) 
            newSet.arr = this.arr[i] & ~(this.arr[i] & otherSet.arr[i]);
        
        return newSet;
    };

}

/**
 * Retorna um novo Set com a interseção entre os dois Sets.
 * @param {Set} setA 
 * @param {Set} setB 
 * @returns {Set} Novo set com a interseção
 */
function setIntersection(setA, setB) {
    const _intersection = new Set();
    for (const elem of setB) {
        if (setA.has(elem))
            _intersection.add(elem);
    }
    return _intersection;
}

/**
 * Retorna um novo Set com a setA - setB.
 * @param {Set} setA 
 * @param {Set} setB 
 * @returns {Set} Novo set com a diferença
 */
function setDifference(setA, setB) {
    const _difference = new Set(setA);
    for (const elem of setB)
        _difference.delete(elem);
    return _difference;
}

endGame = false;
let gRespostasCertasEsquerda = null;
let gRespostasCertasDireita = null;
function game() {
    'use strict';
    reset();
    //iniciar variaveis de controle
    var tamOpcoes = 0; //quantidade de opções de resposta
    var coresDistintas = 0; //quantidade de cores distintas possiveis nas opcoes
    var formasDistintas = 0; //quantidade de formas distintas possiveis nas opcoes
    var tamanhosDistintos = 0; //quantidade de tamanhos distintas possiveis nas opcoes
    var contornosDistintos = 0; //quantidade de contornos distintas possiveis nas opcoes
    var i;
    var j;
    var textNumeroFaseDom = document.getElementById(textNumeroFase);
    textNumeroFaseDom.innerHTML = (etapaAtual + 1);

    let stageData = [
        {
            // no intersection
            restrictionClasses: [
            //  [              class, accepted?, rejQty, rejectionMode]
                [CARACTERISTIC.SHAPE,     true],
            ],
            maxNumAnswers: 2,
            maxNumShapes: 3,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [             class, max]
                [CARACTERISTIC.COLOR,   2]
            ]
        },
        {
            // with intersection
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     true],
                [CARACTERISTIC.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.COLOR,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // SPECIFIC TEST
            restrictionClasses: [
            //  [                class, accepted?, rejQty,        rejectionMode]
                [CARACTERISTIC.SHAPE,     false,      1, ONE_SIDE.NO_ACCEPTED], 
                [CARACTERISTIC.COLOR,     true],
                [CARACTERISTIC.SIZE,      true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected
            restrictionClasses: [
            //  [                class, accepted?, rejQty,        rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      1, ONE_SIDE.NO_ACCEPTED], 
                [CARACTERISTIC.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 2 rejections
            restrictionClasses: [
            //  [                class, accepted?, rejQty,        rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      2, ONE_SIDE.NO_ACCEPTED], 
                [CARACTERISTIC.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 2 rejections with one accepted
            restrictionClasses: [
            //  [                class, accepted?, rejQty,          rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      2, ONE_SIDE.WITH_ACCEPTED], 
                [CARACTERISTIC.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 3 rejections on both sides
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      3,    BOTH_SIDES], 
                [CARACTERISTIC.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 3 rejections on both sides. Random maxed out
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      3,    BOTH_SIDES], 
                [CARACTERISTIC.OUTLINE,     true]
            ],
            maxNumAnswers: 6,
            maxNumShapes: 12,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  3],
                [   CARACTERISTIC.SIZE,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, using rejected, with 3 rejections on both sides. Random maxed out, all restrictions
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      3,    BOTH_SIDES], 
                [CARACTERISTIC.OUTLINE,     true],
                [  CARACTERISTIC.COLOR,     true],
                [   CARACTERISTIC.SIZE,     true]
            ],
            maxNumAnswers: 9,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  3],
                [   CARACTERISTIC.SIZE,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // with intersection, just rejected (all maxed out). Random maxed out
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      3,    BOTH_SIDES], 
                [  CARACTERISTIC.COLOR,     false,      2,    BOTH_SIDES],
                [   CARACTERISTIC.SIZE,     false,      1,    ONE_SIDE.NO_ACCEPTED],
                [CARACTERISTIC.OUTLINE,     false,      1,    ONE_SIDE.NO_ACCEPTED]
            ],
            maxNumAnswers: 9,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  3],
                [   CARACTERISTIC.SIZE,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
        {
            // ONE_SIDE.WITH_ACCEPTED preprocessor test
            // SHAPE rejQty is too high!
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      3,    ONE_SIDE.WITH_ACCEPTED], 
                [  CARACTERISTIC.COLOR,     false,      2,    BOTH_SIDES],
            ],
            maxNumAnswers: 9,
            maxNumShapes: 15,
            // for non specified classes, the limit is 1
            randomLimits: [
            //  [               class, max]
                [  CARACTERISTIC.SHAPE,  4],
                [  CARACTERISTIC.COLOR,  3],
                [   CARACTERISTIC.SIZE,  2],
                [CARACTERISTIC.OUTLINE,  2]
            ]
        },
    ];

    /*Padronizado os valores das variaveis de controle de acordo com a etapa sendo:
    0-9: Duas caixas | 10-19: Três caixas (Com respostas nas opções) | 20-29: Mais de uma restrição 
    30-37: Restrições "Negado" e "Aceito" | 38-39: Três caixas (Sem respostas nas opções)*/
    switch (etapaAtual) {
        case 0:
            tamOpcoes = 4;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 1:
            tamOpcoes = 4;
            restricao1[forma] = formasEnum.circulo;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 2:
            tamOpcoes = 5;
            restricao1[forma] = formasEnum.circulo;
            restricao2[forma] = formasEnum.triangulo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 3:
            tamOpcoes = 5;
            restricao1[forma] = formasEnum.retangulo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 4:
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 4:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 5:
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 6:
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.azul;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 7:
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.amarelo;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 8:
            tamOpcoes = 5;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 9:
            tamOpcoes = 6;
            restricao1[tamanho] = tamanhoEnum.pequeno;
            restricao2[tamanho] = tamanhoEnum.grande;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 10:   //Inicia intersecção (com resposta)
            tamOpcoes = 4;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 11:
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.amarelo;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 12:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.circulo;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 13:
            tamOpcoes = 7;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[forma] = formasEnum.triangulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 14:
            tamOpcoes = 5;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 15:
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.circulo;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 16:
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 17:
            tamOpcoes = 6;
            restricao1[tamanho] = tamanhoEnum.grande;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 18:
            tamOpcoes = 6;
            restricao1[contorno] = contornoEnum.comContorno;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[contorno] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 19:
            tamOpcoes = 7;
            restricao1[cor] = coresEnum.azul;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 20:     //Mais de uma restrição
            tamOpcoes = 8;
            restricao1[forma] = formasEnum.quadrado;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[contorno] = contornoEnum.semContorno;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[contorno] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 21:
            tamOpcoes = 8;
            restricao1[cor] = coresEnum.azul;
            restricao1[cor] = coresEnum.amarelo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 22:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.circulo;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[contorno] = contornoEnum.semContorno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[contorno] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 23:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.circulo;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[contorno] = contornoEnum.comContorno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[contorno] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 24:
            tamOpcoes = 7;
            restricao1[contorno] = contornoEnum.semContorno;
            restricao1[forma] = formasEnum.retangulo;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[contorno] = 'Aceito';
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 25:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.quadrado;
            restricao2[tamanho] = tamanhoEnum.grande;
            restricao2[cor] = coresEnum.azul;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 26:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.retangulo;
            restricao2[tamanho] = tamanhoEnum.grande;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
        case 27:
            tamOpcoes = 7;
            restricao1[tamanho] = tamanhoEnum.grande;
            restricao2[contorno] = contornoEnum.semContorno;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao2[contorno] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 1;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            break;
        case 28:
            tamOpcoes = 7;
            restricao1[tamanho] = tamanhoEnum.pequeno;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.circulo;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 29:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.triangulo;
            restricao1[cor] = coresEnum.amarelo;
            restricao2[tamanho] = tamanhoEnum.grande;
            restricao2[contorno] = contornoEnum.semContorno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            break;
        case 30:          //Restrição proibida
            tamOpcoes = 7;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.triangulo;
            estadoRestricao1[cor] = 'Negado';
            estadoRestricao2[forma] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 31:
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.azul;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[cor] = 'Negado';
            estadoRestricao2[cor] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            break;
        case 32:
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.circulo;
            restricao2[tamanho] = tamanhoEnum.grande;
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao2[tamanho] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            break;
        case 33:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.circulo;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[contorno] = contornoEnum.semContorno;
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao2[contorno] = 'Negado';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 34:
            tamOpcoes = 7;
            restricao1[contorno] = contornoEnum.comContorno;
            restricao1[forma] = formasEnum.retangulo;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[contorno] = 'Negado';
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao2[cor] = 'Negado';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 35:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.quadrado;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            restricao2[cor] = coresEnum.azul;
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao2[tamanho] = 'Negado';
            estadoRestricao2[cor] = 'Negado';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 36:
            tamOpcoes = 7;
            restricao1[contorno] = contornoEnum.semContorno;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[contorno] = 'Negado';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            break;
        case 37:
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.retangulo;
            restricao1[forma] = formasEnum.quadrado;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao2[tamanho] = 'Negado';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            break;
        case 38:                  //Sem necessidade de resposta correta nas opções
            tamOpcoes = 8;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[forma] = formasEnum.circulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            break;
        case 39:
            tamOpcoes = 7;
            restricao1[contorno] = contornoEnum.comContorno;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[contorno] = 'Negado';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            endGame = true;
            break;
        default:
            return;
    }

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

    // definir as restrções para cada caixa

    let acceptedRestrictionsLeft = new CaracteristicContainer();
    let rejectedRestrictionsLeft = new CaracteristicContainer();
    let acceptedRestrictionsRight = new CaracteristicContainer();
    let rejectedRestrictionsRight = new CaracteristicContainer();

    let leftChoosenSets = [];
    let rightChoosenSets = [];
    let middleChoosenSets = [];

    if (!intersecaoAtiva) {
        // níveis iniciais, eles devem ter somente uma classe de restrição que deve sempre ser aceita
        if (currentStage.acceptedClasses.length === 0)
            throw new Error('Nenhuma classe aceita num nível inicial! Etapa atual era ', etapaAtual);

        let classe = currentStage.acceptedClasses[0];
        let caracteristicasDisponiveis = [...classe];
        let [left, right] = pickRandom(caracteristicasDisponiveis, 2);
        acceptedRestrictionsLeft.insert(classe, left);
        acceptedRestrictionsRight.insert(classe, right);

        // random control
        currentStage.randomLimits.delete(classe);
        let leftSet = new CaracteristicSetContainer().add(classe, left),
            rightSet = new CaracteristicSetContainer().add(classe, right);

        for (const [classe, qty] of currentStage.randomLimits.entries()) {
            let choosenCaracteristics = pickRandom([...classe], qty);
            leftSet.add(classe, ...choosenCaracteristics);
            rightSet.add(classe, ...choosenCaracteristics);
        }

        leftChoosenSets = leftSet.toSingleSubsets();
        rightChoosenSets = rightSet.toSingleSubsets();

    } else {
        // distribuir as restrições entre as caixas

        let smallerBoxRatio = -Math.abs(0.5 - randomNormalDistr()) + 0.5; // (0, 0.5] with mean 0.5
        let smallerBoxAccepted,
            smallerBoxRejected,
            biggerBoxAccepted,
            biggerBoxRejected;
        let smallerBoxSize = 0,
            biggerBoxSize = 0;

        // definir qual caixa vai ser a menor (tem menos restrições)
        if (Math.random() <= 0.5) {
            smallerBoxAccepted = acceptedRestrictionsLeft;
            smallerBoxRejected = rejectedRestrictionsLeft;
            biggerBoxAccepted = acceptedRestrictionsRight;
            biggerBoxRejected = rejectedRestrictionsRight;
        } else {
            smallerBoxAccepted = acceptedRestrictionsRight;
            smallerBoxRejected = rejectedRestrictionsRight;
            biggerBoxAccepted = acceptedRestrictionsLeft;
            biggerBoxRejected = rejectedRestrictionsLeft;
        }

        /*
        Algoritmo guloso (greedy) para distribuir as restrições entre as caixas:
            1. Inserir características rejeitadas ONE_SIDE:
                One_SIDE.NO_ACCEPTED e ONE_SIDE.WITH_ACCEPTED vão botar rejQty características rejeitadas numa caixa,
                com ONE_SIDE.WITH_ACCEPETED adicionando uma característica aceita na outra caixa também.
                ONE_SIDE.WITH_ACCEPTED é feita primeiro pois facilita correção de distribuições "ruims".
            2. Inserir características rejeitadas BOTH_SIDES:
                Distribui rejQty características rejeitadas entre as duas caixas, garantindo que ambas caixas tenham
                pelo menos uma característica rejeitada (se não seria ONE_SIDE.NO_ACCEPTED).
            3. Inserir características aceitas:
                Insere uma característica aceita em uma caixa.

        Esse algorítmo tenta distribuir as restrições de forma mais próxima possível da proporção (boxesRatio).
        A ordem de inserção foi escolhida para que as regras mais rígídas sejam aplicadas primeiro, pois elas pertubam
        mais a proporção, com as regras mais flexiveis depois, corrigindo essa pertubação.

        Para previnir distribuições "ruims" (como todas astrições em uma caixa só), nós forçamos um "distribuidor" a
        inserir em uma caixa específica (O código que trata a distribuição de restrições ONE_SIDE.WITH_ACCEPTED é um
        distribuidor, por exemplo). O distribuidor que vai ser forçado a inserir em uma caixa é o último que vai ser
        usado pelo nível atual (se um nível não tiver características aceitas, mas tem BOTH_SIDES, este vai ser o último
        distribuidor). As variáveis que forçam seguem o formato <distribuidor>ToFix

        As duas formas de previnir distribuições "ruims" são:
            1. bothNonEmptyFix: forçar que pelo menos uma caixa tenha pelo menos uma restrição
            2. oswaFix: forçar que uma caixa que tem uma restrição ONE_SIDE.WITH_ACCEPTED tenha outra restrição de uma
                classe diferente (previne que a caixa fique vazia, com as formas só na interseção)
        Restrições BOTH_SIDES, se presentes, previnem essas distribuições "ruims" automaticamente.

        Os nomes encurtados dos distribuidores são:
            - oswa: ONE_SIDE.WITH_ACCEPTED
            - osna: ONE_SIDE.NO_ACCEPTED
            - bs: BOTH_SIDES
            - acc: ACCEPTED

        Como ONE_SIDE.WITH_ACCEPTED possui oswaFix, ele é o primeiro distribuidor a rodar.
        */

        // decidir quem vai corrigir distribuições "ruims"
        let oswaToFix = false,
            osnaToFix = false,
            //bsToFix = false, // não é necessário, pois BOTH_SIDES corrige tudo automaticamente
            accToFix = false;
        
        let bothNonEmptyFix = false,
            oswaFix = false;

        // Rejeição ONE_SIDE.WITH_ACCEPTED na caixa menor/maior
        let oswaRejOnSmallerBox = false,
            oswaRejOnBiggerBox = false;

        if (currentStage.acceptedClasses.length > 0) {
            bothNonEmptyFix = true;
            accToFix = true;
        } else if (currentStage.rejectedClasses[BOTH_SIDES].length > 0) {
            //bsToFix = true;
        } else if (currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED].length > 0) {
            bothNonEmptyFix = true;
            osnaToFix = true;
        } else if (currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED].length > 0) {
            oswaFix = true;
            oswaToFix = true;
        }

        if (currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED].length > 0) {
            oswaFix = true;
            bothNonEmptyFix = false; // corrigir oswa já corrige bothNonZero
        }

        for (const [rejClass, rejQty] of currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED]) {
            let choosenCaracteristics = pickRandom([...rejClass], rejQty + 1);
            let acceptedCaracteristic = choosenCaracteristics.pop();

            //                só corrige se já houve uma inserção
            if (oswaToFix && (oswaRejOnSmallerBox || oswaRejOnBiggerBox) ) {
                if (oswaRejOnSmallerBox) {
                    smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    biggerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // adicionar a restrição aceita na outra caixa
                    smallerBoxSize += rejQty;
                    biggerBoxSize += 1;
                } else {
                    biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    smallerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // adicionar a restrição aceita na outra caixa
                    biggerBoxSize += rejQty;
                    smallerBoxSize += 1;
                }
                oswaToFix = false;  // corrigido
            }

            // +1 porque estamos adicionando a restrição aceita na outra caixa
            let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + 1 + rejQty),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1 + rejQty);
            
            // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                biggerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // adicionar a restrição aceita na outra caixa
                smallerBoxSize += rejQty;
                biggerBoxSize += 1;
                oswaRejOnSmallerBox = true;
            } else {
                biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                smallerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // adicionar a restrição aceita na outra caixa
                biggerBoxSize += rejQty;
                smallerBoxSize += 1;
                oswaRejOnBiggerBox = true;
            }
        }

        // previne correções desnecessárias
        if (oswaRejOnBiggerBox && oswaRejOnSmallerBox) {
            oswaFix = false;
            bothNonEmptyFix = false;
        }
        

        if (osnaToFix) {
            if (smallerBoxSize > 0 && biggerBoxSize > 0)
                bothNonEmptyFix = false;

            if (bothNonEmptyFix || oswaFix) {
                const [rejClass, rejQty] = currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED].shift();
                let choosenCaracteristics = pickRandom([...rejClass], rejQty);

                // se tem rejeição oswa, as caixas sempre terão tamanho > 0. boxNonZeroFix e oswaFix são mutuamente exclusivos
                let insertOnSmaller = smallerBoxSize === 0 || oswaRejOnSmallerBox;
                if (insertOnSmaller) {
                    smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    smallerBoxSize += rejQty;
                } else {
                    biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    biggerBoxSize += rejQty;
                }
            }
        }
        for (const [rejClass, rejQty] of currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED]) {
            let choosenCaracteristics = pickRandom([...rejClass], rejQty);
            let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + rejQty),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + rejQty);

            // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                smallerBoxSize += rejQty;
            } else {
                biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                biggerBoxSize += rejQty;
            }
        }

        //if (bsToFix) {
        //* não é necessário, pois BOTH_SIDES corrige tudo automaticamente
        //}
        for (const [rejClass, rejQty] of currentStage.rejectedClasses[BOTH_SIDES]) {
            let choosenCaracteristics = pickRandom([...rejClass], rejQty);
            // primeiro insere uma restrição rejeitada em cada caixa
            let smallerCaracteristic = choosenCaracteristics.pop(),
                biggerCaracteristic = choosenCaracteristics.pop();
            smallerBoxRejected.insert(rejClass, smallerCaracteristic);
            biggerBoxRejected.insert(rejClass, biggerCaracteristic);
            smallerBoxSize += 1;
            biggerBoxSize += 1;

            // TODO: calculate how many restrictions can be inserted on each box instead of deciding where to insert for each restriction
            for (const caracteristic of choosenCaracteristics) {
                // inserir cada característica uma de cada vez para tentar chegar mais perto de boxesRatio
                let ratioIfInsertOnSmaller = (smallerBoxSize + 1) / (smallerBoxSize + biggerBoxSize + 1),
                    ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1);
                // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
                if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                    smallerBoxRejected.insert(rejClass, caracteristic);
                    smallerBoxSize += 1;
                } else {
                    biggerBoxRejected.insert(rejClass, caracteristic);
                    biggerBoxSize += 1;
                }
            }

            bothNonEmptyFix = false;
            oswaFix = false;
        }

        if (accToFix) {
            if (smallerBoxSize > 0 && biggerBoxSize > 0)
                bothNonEmptyFix = false;

            if (bothNonEmptyFix || oswaFix) {
                const accClass = currentStage.acceptedClasses.shift();
                let choosenCaracteristic = [...accClass][Math.floor(Math.random() * accClass.length)];

                // se tem rejeição oswa, as caixas sempre terão tamanho > 0. boxNonZeroFix e oswaFix são mutuamente exclusivos
                let insertOnSmaller = smallerBoxSize === 0 || oswaRejOnSmallerBox;
                if (insertOnSmaller) {
                    smallerBoxAccepted.insert(accClass, choosenCaracteristic);
                    smallerBoxSize += 1;
                } else {
                    biggerBoxAccepted.insert(accClass, choosenCaracteristic);
                    biggerBoxSize += 1;
                }
            }
        }
        // TODO: calculate how many restrictions can be inserted on each box instead of deciding where to insert for each restriction
        for (const accClass of currentStage.acceptedClasses) {
            let choosenCaracteristic = [...accClass][Math.floor(Math.random() * accClass.length)];
            let ratioIfInsertOnSmaller = (smallerBoxSize + 1) / (smallerBoxSize + biggerBoxSize + 1),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1);

            // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxAccepted.insert(accClass, choosenCaracteristic);
                smallerBoxSize += 1;
            } else {
                biggerBoxAccepted.insert(accClass, choosenCaracteristic);
                biggerBoxSize += 1;
            }
        }

        if (smallerBoxSize === 0 || biggerBoxSize === 0)
            throw new Error('Deve haver pelo menos duas classes de restrição especificadas quando não há rejeição BOTH_SIDES e é um nível com interseção');

        // <lado>Sets: array de conjuntos que formam todas as formas possíveis na caixa desse lado
        let leftSets = [];
        let rightSets = [];
        let middleSets = []; // interseção
        // gerar os subconjuntos que existem em cada lado
        {
            // conjunto com todas as características
            let universalSet = new CaracteristicSetContainer();
            [...CARACTERISTIC].forEach(classe => universalSet.add(classe, ...classe));

            // construir o conjunto que define o conjunto
            // rejeições são invertidas, pois rejeitar uma característica significa aceitar o complemento

            let leftSet = universalSet.clone();
            acceptedRestrictionsLeft.arr.forEach((caracteristicas, i) => {
                if (caracteristicas.length !== 0)
                    leftSet.set(CARACTERISTIC[i], ...caracteristicas);
            });
            rejectedRestrictionsLeft.arr.forEach((caracteristicas, i) => {
                let classe = CARACTERISTIC[i];
                let set = new CaracteristicSetContainer().add(classe, ...caracteristicas);
                leftSet = leftSet.intersection(set.invert(classe), classe);
            });

            let rightSet = universalSet.clone();
            acceptedRestrictionsRight.arr.forEach((caracteristicas, i) => {
                if (caracteristicas.length !== 0)
                    rightSet.set(CARACTERISTIC[i], ...caracteristicas);
            });
            rejectedRestrictionsRight.arr.forEach((caracteristicas, i) => {
                let classe = CARACTERISTIC[i];
                let set = new CaracteristicSetContainer().add(classe, ...caracteristicas);
                rightSet = rightSet.intersection(set.invert(classe), classe);
            });

            // pega todos os subconjuntos de formas possíveis nas caixas (com cada conjunto representando uma forma),
            // e usa conjuntos para separar a interseção.
            // JSON.stringify é usado para comparar conjuntos, pois Set não tem um método de comparação, então converte
            // os conjuntos em strings e compara as strings

            leftSets = new Set(leftSet.toSingleSubsets().map(set => JSON.stringify(set.arr.map(s => [...s]))));
            rightSets = new Set(rightSet.toSingleSubsets().map(set => JSON.stringify(set.arr.map(s => [...s]))));
            middleSets = setIntersection(leftSets, rightSets);

            leftSets = setDifference(leftSets, middleSets);
            rightSets = setDifference(rightSets, middleSets);

            // converte as strings para conjuntos

            leftSets = [...leftSets].map(setStr => {
                let set = new CaracteristicSetContainer();
                set.arr = JSON.parse(setStr).map(arr => new Set(arr));
                return set;
            });

            rightSets = [...rightSets].map(setStr => {
                let set = new CaracteristicSetContainer();
                set.arr = JSON.parse(setStr).map(arr => new Set(arr));
                return set;
            });

            middleSets = [...middleSets].map(setStr => {
                let set = new CaracteristicSetContainer();
                set.arr = JSON.parse(setStr).map(arr => new Set(arr));
                return set;
            });
        }
        shuffleArray(leftSets);
        shuffleArray(rightSets);
        shuffleArray(middleSets);

        let limitVec = Array(CARACTERISTIC.length);
        currentStage.randomLimits.forEach((limit, classe) => {
            limitVec[classe.id] = limit;
        });

        // calcular o mínimo de características que são necessárias para que nenhuma caixa fique vazia
        // Ex: se é possível que as três caixas só tenham quadrados, escolhemos essa configuração
        // ao invés de escolher outra em que uma caixa tenha círculos e as outras quadrados.
        // Isso usa um algoritmo guloso, o mesmo que o próximo, a diferença é que esse só escolhe um item e para
        let minCombination, minSet;
        {
            let minSetProfit = 0;
            let minSum = Infinity;

            for (const combination of cartesianProduct(leftSets, middleSets, rightSets)) {
                let [leftSet, middleSet, rightSet] = combination;
                let set = new CaracteristicSetContainer().union(leftSet).union(middleSet).union(rightSet);

                let setWeightVec = set.arr.map(s => s.size);
                let effectiveCapacity = Math.min(...setWeightVec.map((w, i) => Math.floor(limitVec[i] / w)));

                let setProfit = 1 * effectiveCapacity;
                if (setProfit < minSetProfit)
                    continue;

                let setWeightSum = setWeightVec.reduce((a, b) => a + b, 0);
                if (setWeightSum >= minSum)
                    continue;

                // novo mínimo encontrado
                minSet = set;
                minCombination = combination;
                minSum = setWeightSum;
                minSetProfit = setProfit;
            }

            console.info('Configuração mínima: ' + JSON.stringify(minSet.arr.map(s => [...s])));
        }

        leftChoosenSets = [minCombination[0]];
        middleChoosenSets = [minCombination[1]];
        rightChoosenSets = [minCombination[2]];

        // as características que estão sendo usadas no monmento
        let currentCaracteristics = minSet;

        if (zipArr(minSet.arr.map(c => c.length), limitVec).some(([a, b]) => a > b)) {
            console.warn('Configuração mínima é menor que o limite. O limite não é razoável, usando a configuração mínima como limite.');
            console.info(`Configuração mínima era: ${minSet.arr.map(c => c.length)}`);
            limitVec = minSet.arr.map(c => c.length);
        }

        // remover os conjuntos já escolhidos
        leftSets.splice(leftSets.indexOf(minCombination[0]), 1);
        middleSets.splice(middleSets.indexOf(minCombination[1]), 1);
        rightSets.splice(rightSets.indexOf(minCombination[2]), 1);

        /*
        Outro algoritmo guloso. Este é o problema da mochila multidimensional 0-1 (0-1 MDKP), só que dinâmico, já que os
        pesos mudam a cada iteração.
        Foi implementado aqui o algoritmo PECH_α desse artigo:
        Akçay, Y., Li, H. & Xu, S.H. Greedy algorithm for the general multidimensional knapsack problem.
        Ann Oper Res 150, 17–29 (2007). https://doi.org/10.1007/s10479-006-0150-4
        O PDF que eu usei está aqui: https://www.sci.wsu.edu/math/faculty/lih/MDKP.pdf (o PDF é gratuito no Springer
        também, acesse pelo link doi)

        O problema que estamos tentando resolver é o seguinte: temos N conjuntos (leftSets, middleSets, rightSets) e
        temos que escolher o maior número possível deles, de forma que currentCaracteristics seja menor ou igual a limitVec.

        Todo conjunto tem um peso, que é 1 para cada classe (as dimensões). Como um conjunto e currentCaracteristics (o
        conjunto de características que estão sendo usadas no momento) podem possuir uma interseção, o "peso real" pode
        não ser [1, 1, 1, 1]. Esse "peso real" é quanto o conjuntos adiciona ao currentCaracteristics.
        Se currentCaracteristics já tem CARACTERISTIC.SHAPE.SQUARE, um conjunto que também tem vai ter peso real zero
        nessa classe/dimensão. Como adicionar um conjunto à solução altera currentCaracteristics, o peso real dos
        conjuntos restantes podem mudar, por isso esse problema é dinâmico.

        A capacidade da mochila é limitVec, que é um vetor com a quantidade máxima de características de cada classe que
        podem ser usadas. Um limitVec igual a [2, 3, 1, 2] siginifica que podemos ter no máximo 2 cores, 3 formas, 1
        tamanho e 2 contornos.

        Mesmo que o artigo use recompença/lucro, aqui ele não é usado, sendo 1 para todos os conjuntos. Isso causa o
        algoritmo a escolher conjuntos com a maior capacidade efetiva, ou seja, conjuntos que possam ter o maior número
        máximo de cópias sem ultrapassar o limite (isso é explicado melhor no artigo). Um cálculo de recompensa que 
        que melhore a qualidade da solução pode ser implementada no futuro.

        PECH é um algoritmo muito bom e muito rápido. No nosso caso, número pequeno de dimenções (4) e número pequeno
        de items (no máximo 93, bem menos em média), ele provê soluções ótimas ou quasi-ótimas. O único algoritmo que
        seria melhor em precisão, devido ao número de items (ver Tabela 10 do artigo), seria PIR_G (Pirkul & Narasimhan,
        1986), mas esse usa programação linear e é mais complexo de implementar.

        A implementação aqui segue o seguinte algoritmo:
        1. Junta todos os conjuntos em um único array, adicionando com eles um identificador de qual lado eles são.
        2. Itera sobre os conjuntos, calculando a recompensa de cada um, escolhendo o melhor e adicionando ele à solução.
        3. Caso esse melhor conjunto tenha capacidade efetiva de 0, o melhor conjunto não é inserido e o algoritmo
           termina, pois não há como inserir mais conjuntos na solução.
        4. Caso contrário, o conjunto é adicionado à solução e o currentCaracteristics é atualizado.
        5. Caso não tenha mais conjuntos para iterar, o algoritmo termina.
        */
        {
            let allSets = [...leftSets.map(s => [leftChoosenSets, s]),
                           ...rightSets.map(s => [rightChoosenSets, s]),
                           ...middleSets.map(s => [middleChoosenSets, s])];

            while(allSets.length !== 0) {
                let maxSet, maxSetSide;
                let maxSetProfit = 0;
                let currentLimit = limitVec.map((l, i) => l - currentCaracteristics.arr[i].size);
                for (const [side, set] of allSets) {
                    let setWeightVec = set.difference(currentCaracteristics).arr.map(s => s.size);

                    //                                                                        previne 0/0. Se w é 0, então a capacidade dessa dimensão é infinita
                    let effectiveCapacity = Math.min(...setWeightVec.map((w, i) => Math.floor(w === 0 ? Infinity : currentLimit[i] / w)));
                    if (effectiveCapacity === 0) {
                        // não pode ser escolhido, não cabe
                        continue;
                    }

                    let setProfit = 1 * effectiveCapacity;
                    if (setProfit > maxSetProfit) {
                        // novo máximo encontrado
                        maxSet = set;
                        maxSetSide = side;
                        maxSetProfit = setProfit;

                        // se a recompensa é infinita, não há como conseguir um conjunto melhor
                        if (setProfit === Infinity)
                            break;
                    }
                }

                // nenhum conjunto cabe, terminamos
                if (maxSetProfit === 0) break;

                // adiciona o conjunto à solução
                maxSetSide.push(maxSet);
                currentCaracteristics = currentCaracteristics.union(maxSet);
                // remove o conjunto escolhido do array
                allSets.splice(allSets.findIndex(([_, s]) => s === maxSet), 1);
            }
        }
    }

    // gerar as formas em cada caixa
    let caixaEsquerdaItems = gerarFormas(leftChoosenSets);
    let caixaIntersecaoItems = gerarFormas(middleChoosenSets);
    let caixaDireitaItems = gerarFormas(rightChoosenSets);

    // limitar a quantidade de formas mantendo a quantidade mais ou menos bem dividida entre as caixas
    {
        let maxLengths = [[caixaEsquerdaItems,   Math.round(currentStage.maxNumShapes/3)],
                          [caixaIntersecaoItems, Math.round(currentStage.maxNumShapes/3)],
                          [caixaDireitaItems,    Math.round(currentStage.maxNumShapes/3)]];
        maxLengths.sort(([box1, _1], [box2, _2]) => box1.length - box2.length);
        // caixa menor recebe um limite maior (ignora interseção)
        if (maxLengths[0][0] !== caixaIntersecaoItems)
            maxLengths[0][1] = currentStage.maxNumShapes - Math.round(currentStage.maxNumShapes/3 * 2);
        else
            maxLengths[1][1] = currentStage.maxNumShapes - Math.round(currentStage.maxNumShapes/3 * 2);
        
        if (maxLengths[0][0].length < maxLengths[0][1]) {
            // uma caixa tem menos que o limite/3, então restringir a quantidade de formas baseado nela
            let maxToBeRedistributed = currentStage.maxNumShapes;
            let minLength = maxLengths[0][0] !== caixaIntersecaoItems ? maxLengths[0][0].length : maxLengths[1][0].length;
            maxLengths = maxLengths.map(([box, _], i) => {
                let maxLength = Math.min(box.length, Math.round(minLength * (Math.random() + 1)), Math.round(maxToBeRedistributed/(maxLengths.length - i)));
                maxToBeRedistributed -= maxLength;
                return [box, maxLength];
            });
        }
        maxLengths.forEach(([box, maxLength]) => {
            Object.assign(box, pickRandom(box, maxLength));
            box.length = maxLength;
        });
    }

    // colocar as repostas nas referências globais para ser usado na checagem da resposta
    let respostasCertasEsquerda = new Set([...acceptedRestrictionsLeft.get().map(caracteristica => [caracteristica, ACCEPTED]),
                                           ...rejectedRestrictionsLeft.get().map(caracteristica => [caracteristica, REJECTED])]);
    let respostasCertasDireita = new Set([...acceptedRestrictionsRight.get().map(caracteristica => [caracteristica, ACCEPTED]),
                                          ...rejectedRestrictionsRight.get().map(caracteristica => [caracteristica, REJECTED])]);
    

    // adicionar as restrições corretas nas respostas
    let respostasItems = [...respostasCertasEsquerda, ...respostasCertasDireita];
    // gerar regras que são incorretas
    let todasCaracteristicas = [...CARACTERISTIC].map(classe => [...classe]).flat();
    // obter as regras comuns à todos items da interseção
    /* devido a ES6 Sets compararem por referência, as operações de sets foram feitas com arrays usando bitsets:
       o índice do array é equivalente ao índice em todasCaracteristicas e o valor é um bitset:
       bit 0 - 1 se a rejeição dessa caracteristica é aplicavel ao conjunto (1 << REJECTED == 0b01)
       bit 1 - 1 se a aceitação caracteristica é aplicavel ao conjunto (1 << ACCEPTED == 0b10)

       esse bitset reflete se como a caracteristica é aplicavel ao aquele conjunto de items:
        0b00 - caracteristica não é aplicavel ao conjunto (interseção de um conjunto 0b01 e outro 0b10)
        0b01 - caracteristica é rejeitada no conjunto (todos os items rejeitam a caracteristica)
        0b10 - caracteristica é aceita no conjunto (todos os items aceitam a caracteristica)
        0b11 - caracteristica é aceita e rejeitada no conjunto (união de um conjunto 0b01 e outro 0b10)
    */
    // primeiro obter as restrições de cada forma. Todas as características que a forma possui são aceitas, as que ela não possui são rejeitadas
    // (ex: se a forma é quadrada, então a característica quadrado é aceita e as características retângulo, círculo e triângulo são rejeitadas)
    let regrasItemsIntersecao = caixaIntersecaoItems.map(item => todasCaracteristicas.map(caracteristica => 1 << (caracteristica == item.get(CARACTERISTIC.getClass(caracteristica)))));
    let regrasUsadas = [
                                 // obter as regras comuns à todos items em cada uma das caixas
                                 caixaEsquerdaItems.map(item => todasCaracteristicas.map(caracteristica => 1 << (caracteristica == item.get(CARACTERISTIC.getClass(caracteristica)))))
                                                   .concat(regrasItemsIntersecao) // concatena as formas da interseção, já que também fazem parte da caixa esquerda
                                                   .reduce((acc, cur) => cur.map((_, i) => (acc[i] || []).concat(cur[i])), []) // faz o zip em todos os arrays dentro do array
                                                   .map(el => el.reduce((a, c) => a & c)), // bitwise AND todos os elementos do array, obtendo a interseção das regras de todas as formas da caixa, que é um conjunto de todas as regras aplicaveis a essa caixa
                                 caixaDireitaItems.map(item => todasCaracteristicas.map(caracteristica => 1 << (caracteristica == item.get(CARACTERISTIC.getClass(caracteristica)))))
                                                   .concat(regrasItemsIntersecao)
                                                   .reduce((acc, cur) => cur.map((_, i) => (acc[i] || []).concat(cur[i])), [])
                                                   .map(el => el.reduce((a, c) => a & c))
                                ].reduce((acc, cur) => cur.map((_, i) => (acc[i] || []).concat(cur[i])), []) // zip
                                 .map(el => el.reduce((a, c) => a | c)); // faz a união das regras das caixas
    let regrasNaoUsadas = todasCaracteristicas.map(_ => (1 << ACCEPTED) || (1 << REJECTED)) // obtem todas as regras possíveis
                                          .map((el, i) => el & ~regrasUsadas[i]) // remove as regras usadas
                                          .map(el => {
                                                // converte de bitset para aceito/rejeitado
                                                let res = [];
                                                if (el & (1 << ACCEPTED)) res.push(ACCEPTED);
                                                if (el & (1 << REJECTED)) res.push(REJECTED);
                                                return res;
                                          })
                                          .flatMap((el, i) => el.map(el => [todasCaracteristicas[i], el]));
    shuffleArray(regrasNaoUsadas);

    // completar as respostas com as regras incorretas para respostasItems ter currentStage.numOptions
    respostasItems = respostasItems.concat(regrasNaoUsadas).slice(0, currentStage.maxNumAnswers);
    shuffleArray(respostasItems);

    /*Containers*/
    let divRespostas = document.getElementById(divRespostasId);
    let divRestricaoEsquerda = document.getElementById(divRestricaoEsquerdaId);
    let divRestricaoDireita = document.getElementById(divRestricaoDireitaId);

    let divCaixaEsquerda = document.getElementById(divCaixaEsquerdaId);
    let divCaixaDireita = document.getElementById(divCaixaDireitaId);
    let divCaixaIntersecao = document.getElementById(divCaixaIntersecaoId);

    //renderizando restrições em "regras disponíveis"
    gRespostasCertasEsquerda = [];
    gRespostasCertasDireita = [];
    respostasItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = CARACTERISTIC_EXTRA.getRestricaoScr(item);
        imgTag.alt = CARACTERISTIC_EXTRA.getRestricaoAlt(item);
        imgTag.title = imgTag.alt;
        imgTag.classList.add('drag');
        //imgTag.classList.add('game-img');
        //imgTag.classList.add('img-restricao-esquerda');
        if (respostasCertasEsquerda.has(item))
            gRespostasCertasEsquerda.push(imgTag);
        else if (respostasCertasDireita.has(item))
            gRespostasCertasDireita.push(imgTag);
        divRespostas.appendChild(imgTag);
    });

    caixaEsquerdaItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = CARACTERISTIC_EXTRA.getFormaSrc(item);
        imgTag.alt = CARACTERISTIC_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(CARACTERISTIC.SIZE) === CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
        imgTag.classList.add(item.get(CARACTERISTIC.SIZE) === CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        divCaixaEsquerda.appendChild(imgTag);
    });

    caixaDireitaItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = CARACTERISTIC_EXTRA.getFormaSrc(item);
        imgTag.alt = CARACTERISTIC_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(CARACTERISTIC.SIZE) == CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        divCaixaDireita.appendChild(imgTag);
    });

    caixaIntersecaoItems.forEach(item => {
        let imgTag = document.createElement("img");
        imgTag.src = CARACTERISTIC_EXTRA.getFormaSrc(item);
        imgTag.alt = CARACTERISTIC_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item.get(CARACTERISTIC.SIZE) == CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        divCaixaIntersecao.appendChild(imgTag);
    });


    // configurar o visual das caixas
    let dropzoneArea = document.getElementById('dropzone-container-grupos-regras');
    if (!intersecaoAtiva) {
        divCaixaEsquerda.setAttribute('style', 'grid-column: 2/3; grid-row: 1/3;');
        divCaixaDireita.setAttribute('style', 'grid-column: 4/5; grid-row: 1/3; align-content: flex-start');
        divCaixaIntersecao.setAttribute('style', 'display: none;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr 5fr 1fr 5fr 2fr;');
        divCaixaEsquerda.classList.remove('drop-meio-ativo');
        divCaixaIntersecao.classList.remove('drop-meio-ativo');
        divCaixaDireita.classList.remove('drop-meio-ativo');
        divRestricaoDireita.setAttribute('style', 'margin-top: 0px;');

        let caixaEsquerdaDrop = document.getElementById("container-restricao-esquerda");
        caixaEsquerdaDrop.style.marginLeft = "160px";
        let caixaDireitaDrop = document.getElementById("container-restricao-direita");
        caixaDireitaDrop.style.marginLeft = "10px";
    } else {
        divCaixaEsquerda.setAttribute('style', 'grid-column: 2/4; grid-row: 1/3;');
        divCaixaDireita.setAttribute('style', 'grid-column: 3/5; grid-row: 2/4; align-content: flex-end');
        divCaixaIntersecao.setAttribute('style', 'grid-column: 3/4; grid-row: 2/3;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr repeat(3, 3fr) 2fr;');
        divCaixaEsquerda.classList.add('drop-meio-ativo');
        divCaixaIntersecao.classList.add('drop-meio-ativo');
        divCaixaDireita.classList.add('drop-meio-ativo');
        divCaixaDireita.setAttribute('align-content', 'flex-end');
        divRestricaoDireita.setAttribute('style', 'margin-top: 45px;');
    }

    /*verificar quantas imagens eu preciso criar*/
    /*verificar quantas imagens eu preciso criar*/
    var arrayReferencia = [];
    var arrayIndices = [];
    var arrayDeOpcoes = [];
    var arrayOpcoesFinal = [];
    var novaImagem;
    let numero = 0;
    quantidade = 0;

    var arrayReferenciaDois = [];
    var arrayIndicesDois = [];
    var arrayDeOpcoesDois = [];
    var arrayOpcoesFinalDois = [];
    var novaImagemDois;
    let numeroDois = 0;

    if (etapaAtual < 10) { //Inicial - Sem intersecção - 2 respostas prontas 
        quantidade = 2;
    }
    if (etapaAtual > 11 && etapaAtual < 38) { //Intermediário - Com intersecção - 3 respostas prontas 
        quantidade = 3;
    }

    /* Primeira imagem correta*/
    for (i = 0; i < (tamOpcoes - 1); i++) {
        arrayReferencia.push('');
    }

    for (j = 0; j < (tamOpcoes - 1); j++) {
        arrayReferenciaDois.push('');
    }

    novaImagem = imgRestricao(coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
    arrayDeOpcoes.push(novaImagem);

    novaImagemDois = imgRestricao(coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
    arrayDeOpcoesDois.push(novaImagemDois);

    //Criar a quantidade de imagens especificadas e fazer o push para o array

    i = 2;
    arrayReferencia.forEach(el => {

        do {
            novaImagem = novaImgBlocoLogicoComRestricoes(arrayDeOpcoes, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos, i, quantidade);
        } while (repetida(novaImagem, arrayDeOpcoes));
        arrayDeOpcoes.push(novaImagem);
        i++;

    });

    j = 2;
    arrayReferenciaDois.forEach(el => {

        do {
            novaImagemDois = novaImgBlocoLogicoComRestricoes(arrayDeOpcoesDois, coresDistintas = 2, formasDistintas = 2, tamanhosDistintos = 2, contornosDistintos = 2, j = 2, quantidade = 2);
        } while (repetida(novaImagemDois, arrayDeOpcoesDois));
        arrayDeOpcoesDois.push(novaImagemDois);
        j++;

    });

    /* Gera as imagens das restrições */
    console.log('RESTRICOES');
    for (i = 0; i < 4; i++) {
        arrayReferencia.push('');
    }
    i = 0;

    for (j = 0; j < 4; j++) {
        arrayReferenciaDois.push('');
    }
    j = 0;

    arrayReferencia.forEach(el => {  //Caixa da esquerda

        if (restricao1[i] == null) {
            i++;
            return;
        }
        else {
            novaImagem = getRestrictScr(estadoRestricao1[i], i, restricao1[i]);
            novaImagem.setAttribute('class', 'img-restricao-esquerda');
            // console.log(novaImagem.getAttribute("src"));
            // divRestricaoEsquerda.appendChild(novaImagem);
            // divRespostas.appendChild(novaImagem);
        }

        i++;

    });

    i = 0;
    arrayReferencia.forEach(el => {  //Caixa da direita

        if (restricao2[i] == null) {
            i++;
            return;
        }
        else {
            //gerando a lógica para uma imagem restrição
            novaImagem = getRestrictScr(estadoRestricao2[i], i, restricao2[i]);
            novaImagem.setAttribute('class', 'img-restricao-direita');
            // console.log(novaImagem.getAttribute("src"));
            // divRestricaoDireita.appendChild(novaImagem);
            // divRespostas.appendChild(novaImagem);
        }

        i++;

    });

    /*Modifica a ordem das imagens no array*/
    arrayDeOpcoes.forEach(el => {
        do {
            numero = getRandomIntInclusive(0, (tamOpcoes - 1));
        } while (conferir(numero, arrayIndices));

        arrayOpcoesFinal[numero] = el;
        arrayIndices.push(numero);
    });

    arrayDeOpcoesDois.forEach(el => {
        do {
            numeroDois = getRandomIntInclusive(0, (tamOpcoes - 1));
        } while (conferir(numeroDois, arrayIndicesDois));

        arrayOpcoesFinalDois[numeroDois] = el;
        arrayIndicesDois.push(numeroDois);
    });

    //implementando interrogação
    // let interrogacaoEsq = document.getElementById("container-restricao-esquerda");

    console.log("CERTAS ESQUERDA: " + gRespostasCertasEsquerda.length);
    console.log("CERTAS DIREITA: " + gRespostasCertasDireita.length);

    // for (let i = 0; i < gRespostasCertasEsquerda.length; i++) {
    //     interrogacaoEsq.style.backgroundImage = "url('../img/bg-slot.svg')";
    //     interrogacaoEsq.style.backgroundRepeat = "no-repeat";
    // }

    // let interrogacaoDir = document.getElementById("container-restricao-direita");

    // for (let j = 0; j < gRespostasCertasDireita.length; j++) {
    //     interrogacaoDir.style.backgroundImage = "url('../img/bg-slot.svg')";
    //     interrogacaoDir.style.backgroundRepeat = "no-repeat";
    // }

    let interrogacaoEspaco = 46; // altura da img da restrição
 
    let interrogacaoEsq = document.getElementById("container-restricao-esquerda");
    interrogacaoEsq.style.backgroundImage = "url('../img/bg-slot.svg'),".repeat(gRespostasCertasEsquerda.length).slice(0, -1);
    interrogacaoEsq.style.backgroundRepeat = "no-repeat,".repeat(gRespostasCertasEsquerda.length).slice(0, -1);
    interrogacaoEsq.style.backgroundPosition = Array(gRespostasCertasEsquerda.length).fill(`top Xpx left`).map((str, i) => str.replace("X", i*interrogacaoEspaco)).join(",");
 
    let interrogacaoDir = document.getElementById("container-restricao-direita");
    interrogacaoDir.style.backgroundImage = "url('../img/bg-slot.svg'),".repeat(gRespostasCertasDireita.length).slice(0, -1);
    interrogacaoDir.style.backgroundRepeat = "no-repeat,".repeat(gRespostasCertasDireita.length).slice(0, -1);
    interrogacaoDir.style.backgroundPosition = Array(gRespostasCertasDireita.length).fill(`top Xpx right`).map((str, i) => str.replace("X", i*interrogacaoEspaco)).join(",");

    // exibindo imagens ao lado esquerdo da caixa de drop esquerdo
    // arrayOpcoesFinal.forEach(el => {
    //     // divRespostas.appendChild(el);
    //     divRestricaoEsquerda.appendChild(el);
    // });

    // arrayOpcoesFinalDois.forEach(el => {
    //     divRestricaoDireita.appendChild(el);
    // });

    //background(1);

}

function background(caixas) {

    var dropzoneArea = document.getElementById('dropzone-container-grupos-regras');
    var dropEsquerda = document.getElementById(dropEsquerdoId);
    var dropMeio = document.getElementById(dropIntersecaoId);
    var dropDireita = document.getElementById(dropDireitoId);

    /* Gerar imagens do fundo */
    if (caixas == 2) {

        dropEsquerda.setAttribute('style', 'grid-column: 2/3; grid-row: 1/;');
        dropDireita.setAttribute('style', 'grid-column: 4/5; grid-row: 2/4;');
        dropMeio.setAttribute('style', 'display: none;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr 5fr 1fr 5fr 2fr;');
        dropEsquerda.classList.remove('drop-meio-ativo');
        dropMeio.classList.remove('drop-meio-ativo');
        dropDireita.classList.remove('drop-meio-ativo');

    } else {

        dropEsquerda.setAttribute('style', 'grid-column: 2/4; grid-row: 1/3;');
        dropDireita.setAttribute('style', 'grid-column: 3/5; grid-row: 2/4;');
        dropMeio.setAttribute('style', 'grid-column: 3/4; grid-row: 2/3;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr repeat(3, 3fr) 2fr;');
        dropEsquerda.classList.add('drop-meio-ativo');
        dropMeio.classList.add('drop-meio-ativo');
        dropDireita.classList.add('drop-meio-ativo');

    }
}

function first(container, letra) {   //Analisa a caixa da esquerda

    /*contador - índice do array, armazenando a quantidade de flags por imagem
    flag - indica se o atributo é diferente do contido na restrição 
    aux - guarda o valor de todas as flags*/
    var contador = 0, flag = 0, aux = 0;

    /*Analisa as imagens do container com relação a primeira restrição*/
    Array.prototype.filter.call(container, el => {
        flag = 0;

        if (estadoRestricao1[forma] != null && estadoRestricao1[forma] == 'Aceito') {
            if (restricao1[0] != null && el.getAttribute('data-tipo') != restricao1[forma]) {
                flag++;
            }
        }
        if (estadoRestricao1[forma] != null && estadoRestricao1[forma] == 'Negado') {
            if (restricao1[0] != null && el.getAttribute('data-tipo') == restricao1[forma]) {
                flag++;
            }
        }

        if (estadoRestricao1[cor] != null && estadoRestricao1[cor] == 'Aceito') {
            if (restricao1[1] != null && el.getAttribute('data-cor') != restricao1[cor]) {
                flag++;
            }
        }
        if (estadoRestricao1[cor] != null && estadoRestricao1[cor] == 'Negado') {
            if (restricao1[1] != null && el.getAttribute('data-cor') == restricao1[cor]) {
                flag++;
            }
        }

        if (estadoRestricao1[tamanho] != null && estadoRestricao1[tamanho] == 'Aceito') {
            if (restricao1[2] != null && el.getAttribute('data-tam') != restricao1[tamanho]) {
                flag++;
            }
        }
        if (estadoRestricao1[tamanho] != null && estadoRestricao1[tamanho] == 'Negado') {
            if (restricao1[2] != null && el.getAttribute('data-tam') == restricao1[tamanho]) {
                flag++;
            }
        }


        if (estadoRestricao1[contorno] != null && estadoRestricao1[contorno] == 'Aceito') {
            if (restricao1[3] != null && el.getAttribute('data-cont') != restricao1[contorno]) {
                flag++;
            }
        }
        if (estadoRestricao1[contorno] != null && estadoRestricao1[contorno] == 'Negado') {
            if (restricao1[3] != null && el.getAttribute('data-cont') == restricao1[contorno]) {
                flag++;
            }
        }

        if (letra == 's') {
            imgMov1[contador] = flag;
        }

        contador++;
        aux = aux + flag;
    });

    return aux;
}

function third(container, letra) {   //Analisa a caixa da direita

    /*contador - índice do array, armazenando a quantidade de flags por imagem
    flag - indica se o atributo é diferente do contido na restrição 
    aux - guarda o valor de todas as flags*/
    var contador = 0, flag = 0, aux = 0;

    /*Analisa as imagens do container com relação a segunda restrição*/
    Array.prototype.filter.call(container, el => {
        flag = 0;

        if (estadoRestricao2[forma] != null && estadoRestricao2[forma] == 'Aceito') {
            if (restricao2[forma] != null && el.getAttribute('data-tipo') != restricao2[forma]) {
                flag++;
            }
        }
        if (estadoRestricao2[forma] != null && estadoRestricao2[forma] == 'Negado') {
            if (restricao2[0] != null && el.getAttribute('data-tipo') == restricao2[forma]) {
                flag++;
            }
        }

        if (estadoRestricao2[cor] != null && estadoRestricao2[cor] == 'Aceito') {
            if (restricao2[1] != null && el.getAttribute('data-cor') != restricao2[cor]) {
                flag++;
            }
        }
        if (estadoRestricao2[cor] != null && estadoRestricao2[cor] == 'Negado') {
            if (restricao2[1] != null && el.getAttribute('data-cor') == restricao2[cor]) {
                flag++;
            }
        }

        if (estadoRestricao2[tamanho] != null && estadoRestricao2[tamanho] == 'Aceito') {
            if (restricao2[2] != null && el.getAttribute('data-tam') != restricao2[tamanho]) {
                flag++;
            }
        }
        if (estadoRestricao2[tamanho] != null && estadoRestricao2[tamanho] == 'Negado') {
            if (restricao2[2] != null && el.getAttribute('data-tam') == restricao2[tamanho]) {
                flag++;
            }
        }


        if (estadoRestricao2[contorno] != null && estadoRestricao2[contorno] == 'Aceito') {
            if (restricao2[3] != null && el.getAttribute('data-cont') != restricao2[contorno]) {
                flag++;
            }
        }
        if (estadoRestricao2[contorno] != null && estadoRestricao2[contorno] == 'Negado') {
            if (restricao2[3] != null && el.getAttribute('data-cont') == restricao2[contorno]) {
                flag++;
            }
        }

        if (letra == 's') {
            imgMov2[contador] = flag;
        }

        contador++;
        aux = aux + flag;
    });

    return aux;
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
    "use strict";
    let respostasEsquerda = new Set([...document.getElementById(divRestricaoEsquerdaId).children]);
    let respostasDireita = new Set([...document.getElementById(divRestricaoDireitaId).children]);
    let respostasOpcoes = [...document.getElementById(divRespostasId).children];

    // checar se os arrays são do mesmo tamanho
    if (respostasEsquerda.size !== gRespostasCertasEsquerda.length || respostasDireita.size !== gRespostasCertasDireita.length) {
        return quaoIncorreto(respostasOpcoes);
    }

    // checar se as respostas da esquerda possuem todas as respostas corretas
    if (!gRespostasCertasEsquerda.every(resposta => respostasEsquerda.has(resposta)))
        return quaoIncorreto(respostasOpcoes);

    // checar se as respostas da direita possuem todas as respostas corretas
    if (!gRespostasCertasDireita.every(resposta => respostasDireita.has(resposta)))
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
document.addEventListener("dragstart", function (event) {
    console.log('0');
}, false);
