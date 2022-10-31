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
 * Gera formas para uma caixa.
 * Todas as formas terão as restricoesAceitas, e carcateristicas que não estejam em restricoesAceitas, serão randomizada de acordo com escolhasAletaorias.
 * @param {RestrictionContainer} restricoesAceitas // TODO: FIXME // Array de restrições para essa caixa (formato [[CARACTERISTICA, ACCEPTED/REJECTED], ...]. Ex: [[CARACTERISTIC.COLOR.BLUE, ACCEPTED]]
 * @param {Number} maxNumFormas O máximo de formas que podem ser geradas para todas as caixas
 * @param {Map<Object, Number>} escolhasAleatorias Map contendo as escolhas aleatórias para cada classe de característica (formato: Map([[CARACTERISTIC.CLASS, [CARACTERISTIC.CLASS.C, ...]], ...]). Ex: Map([[CARACTERISTIC.COLOR, [CARACTERISTIC.COLOR.BLUE, CARACTERISTIC.COLOR.RED]]])
 * @returns {Map<Object, Number>[]} Array contendo as peças geradas para essa caixa (formato Map([[CLASSE_CARACTERISTICA, CARACTERISTICA], ...]))
 */
function gerarFormas(restricoesAceitas, maxNumFormas, escolhasAleatorias) {
    "use strict";
    // seleciona um número aleatório de formas para gerar
    let numFormasParaGerar = getNormalRandomIntInclusive(1, maxNumFormas);
    let caixaItems = [];

    let escolhasCaracteristicas = new Map();
    // força as caracteristicas aceitas
    for (const classe of [...CARACTERISTIC]) {
        let caracteristicasAceitas = restricoesAceitas.get(classe);
        if (caracteristicasAceitas.length !== 0)
            // subsitui o array de possibilidades pelas caracteristica aceitas
            escolhasCaracteristicas.set(classe, caracteristicasAceitas);
        else
            escolhasCaracteristicas.set(classe, escolhasAleatorias.get(classe));
    }

    let allPiecesPossibilities = [...cartesianProduct(...escolhasCaracteristicas.values())];
    shuffleArray(allPiecesPossibilities);

    for (const pieceMap of allPiecesPossibilities) {
        let piece = new Map();
        for (const caracteristica of pieceMap) {
            piece.set(CARACTERISTIC.getClass(caracteristica), caracteristica);
        }
        caixaItems.push(piece);
        if (caixaItems.length >= numFormasParaGerar) break;
    }

    return caixaItems;
}

/**
 * TODO: doc this
 */
function gerarFormas2(restrictionSets) {
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

function zipArr(arr1, arr2) {
    return arr1.map((k, i) => [k, arr2[i]]);
}

// src: https://stackoverflow.com/a/19270021
// it's a partial fisher-yates shuffle
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

function randomNormalDistr() {
    const sampleSize = 10;
    let random = 0;
    for (let i = 0; i < sampleSize; i++)
        random += Math.random();
    random /= sampleSize;

    return random;
}

const ONE_SIDE = {
    NO_ACCEPTED: 0,
    WITH_ACCEPTED: 1
};
const BOTH_SIDES = 2;

function RestrictionContainer() {
    if (!new.target)
        return new RestrictionContainer();

    // the array of the map
    this.arr = Array.from(Array(CARACTERISTIC.length), () => []);

    // insert restriction on map without passing the class
    this.insertNoHint = function (restricao) {
        let classId = CARACTERISTIC.getClassNumber(restricao);
        this.arr[classId].push(restricao);
    };

    // insert restrictions on map
    this.insert = function (classe, ...restricoes) {
        this.arr[classe.id].push(...restricoes);
    };

    // return all restrictions of a class
    // or all restrictions if no class is given
    this.get = function (classe) {
        if (!classe)
            return this.arr.flat();

        return this.arr[classe.id];
    };

    this.has = function (classe, restricao) {
        return this.arr[classe.id].includes(restricao);
    };

    this.hasNoHint = function (restricao) {
        let classId = CARACTERISTIC.getClassNumber(restricao);
        return this.arr[classId].includes(restricao);
    };

    this.concat = function (other) {
        let newRestrictions = new RestrictionContainer();
        for (let i = 0; i < this.arr.length; i++) 
            newRestrictions.arr[i] = this.arr[i].concat(other.arr[i]);
        
        return newRestrictions;
    };

}

// RestrictionSetContainer is a RestrictionContainer but this.arr[classe.id] is a Set
function RestrictionSetContainer() {
    if (!new.target) 
        // TODO: make it throw
        return new RestrictionSetContainer();
    

    // the array of the map
    this.arr = Array.from(Array(CARACTERISTIC.length), () => new Set());

    // add restriction to map without passing the class
    this.addNoHint = function (restricao) {
        let classId = CARACTERISTIC.getClassNumber(restricao);
        this.arr[classId].add(restricao);
        return this;
    };

    // add restrictions to map
    this.add = function (classe, ...restricoes) {
        restricoes.forEach(restricao => this.arr[classe.id].add(restricao));
        return this;
    };

    // set restrictions to map
    this.set = function (classe, ...restricoes) {
        this.arr[classe.id] = new Set(restricoes);
        return this;
    };

    // return all restrictions of a class
    // or all restrictions if no class is given
    this.get = function (classe) {
        if (!classe) 
            return new Set(this.arr.flatMap(set => [...set]));
        

        return this.arr[classe.id];
    };

    this.has = function (classe, restricao) {
        return this.arr[classe.id].has(restricao);
    };

    this.hasNoHint = function (restricao) {
        let classId = CARACTERISTIC.getClassNumber(restricao);
        return this.arr[classId].has(restricao);
    };

    // TODO: make "virtual" versions of set ops. These make the ops with the empty classes (empty arr entries) as they were full (like invert() were applied to them)

    this.intersection = function (other, classe) {
        let newSet = new RestrictionSetContainer();

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

    this.union = function (other, classe) {
        let newSet = new RestrictionSetContainer();

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

    this.subtract = function (other, classe) {
        let newSet = new RestrictionSetContainer();

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

    this.isSubsetOf = function (other, classe) {
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

    this.isSupersetOf = function (other, classe) {
        // if a class is given, check only that class
        if (typeof classe !== 'undefined') {
            for (const r of other.arr[classe.id]) {
                if (!this.arr[classe.id].has(r)) 
                    return false;
            }
            return true;
        }

        // if class is not given, check all classes
        for (let i = 0; i < this.arr.length; i++) {
            for (const r of other.arr[i]) {
                if (!this.arr[i].has(r)) 
                    return false;
            }
        }

        return true;
    };

    this.equals = function (other, classe) {
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

    this.isEmpty = function (classe) {
        // if a class is given, check only that class
        if (typeof classe !== 'undefined') 
            return this.arr[classe.id].size === 0;

        // if class is not given, check all classes
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i].size !== 0) 
                return false;
        }

        return true;
    };

    this.anyEmpty = function () {
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i].size === 0) 
                return true;
        }

        return false;
    };

    this.invert = function (classe) {
        let newSet = new RestrictionSetContainer();

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

    this.clone = function () {
        let newSet = new RestrictionSetContainer();
        newSet.arr = this.arr.map((set) => new Set(set));
        return newSet;
    };

    this.toSingleSubsets = function (classe) {
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
            let newSet = new RestrictionSetContainer();
            newSet.arr = comb.map(cateristica => new Set([cateristica]));
            subsets.push(newSet);
        }

        return subsets;
    };

    // TODO: maybe make this like Array.length? With the pŕoperty being updated when 'this' is modified?
    this.size = function (classe) {
        // if a class is given, get size only that class
        if (typeof classe !== 'undefined') 
            return this.arr[classe.id].size;

        // if class is not given, get size all classes
        let size = 0;
        for (let i = 0; i < this.arr.length; i++) 
            size += this.arr[i].size;

        return size;
    };
}

/* input:
{
    restrictionClasses: [
      //[              class, accepted?, rejQty, rejectionMode]
        [CARACTERISTIC.SHAPE,     true],
        [CARACTERISTIC.COLOR,     false,      2,    BOTH_SIDES]
    ],
    maxNumAnswers: 27,
    maxNumShapes: 91,
    // for non specified classes, the limit is 1
    randomLimits: [
      //[             class, max]
        [CARACTERISTIC.SIZE,   2]
    ]
}
*/

/* output:
{
    acceptedClasses: [CARACTERISTIC.SHAPE, ...],
    //rejectedClasses: [CARACTERISTIC.COLOR, ...],
    //rejectionOptions: [{qty: 2, mode: BOTH_SIDES}, ...],
    rejectedClasses: {
        // mode: [[class, qty], ...] 
        ONE_SIDE.NO_ACCEPTED: [[CARACTERISTIC.SIZE, 1], ...],
        ONE_SIDE.WITH_ACCEPTED: [[c, n], ...],
        BOTH_SIDES: [[CARACTERISTIC.COLOR, 2], ...]
    }
    maxNumAnswers: 27,
    maxNumShapes: 91,
    randomLimits : new Map([[CARACTERISTIC.SIZE, 2]])
}
*/

function stagePreprocessor(input) {
    'use strict';
    let acceptedClasses = [],
        rejectedClasses = {
            [ONE_SIDE.NO_ACCEPTED]: [],
            [ONE_SIDE.WITH_ACCEPTED]: [],
            [BOTH_SIDES]: []
        };

    // prevents that this function from being deterministic
    // helps to create variety in the game, even if the same input is given
    shuffleArray(input.restrictionClasses);

    for (const def of input.restrictionClasses) {
        let [restrictionClass, accepted, rejQty, rejectionMode] = def;
        if (accepted) {
            acceptedClasses.push(restrictionClass);
        }
        else {
            // TODO: check if the class is already in acceptedClasses
            // TODO: check if the class is already in rejectedClasses
            // TODO: check if rejQty is bigger than zero
            // TODO: check if rejectionMode is valid
            rejectedClasses[rejectionMode].push([restrictionClass, rejQty]);
        }
    }

    // TODO: check for valid limits (ex not < 0)
    // se a classe não foi especificada em randomParameters, limitar a 1 característica
    let randomLimits = new Map([...CARACTERISTIC].map(classe => [classe, 1]));
    for (const [classe, max] of input.randomLimits) 
        randomLimits.set(classe, max);

    // reverse sort each type of rejection by quantity of rejections of that class
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
            maxNumAnswers: 27,
            maxNumShapes: 91,
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
            // with intersection, just rejected (all maxed out). Random maxed out
            restrictionClasses: [
            //  [                class, accepted?, rejQty, rejectionMode]
                [  CARACTERISTIC.SHAPE,     false,      3,    BOTH_SIDES], 
                [  CARACTERISTIC.COLOR,     false,      2,    BOTH_SIDES],
                [   CARACTERISTIC.SIZE,     false,      1,    ONE_SIDE.NO_ACCEPTED],
                [CARACTERISTIC.OUTLINE,     false,      1,    ONE_SIDE.NO_ACCEPTED]
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

    // TODO: set endGame variable properly!
    // TODO: comment this out when done

    // definir as restrções para cada caixa

    let acceptedRestrictionsLeft = new RestrictionContainer();
    let rejectedRestrictionsLeft = new RestrictionContainer();
    let acceptedRestrictionsRight = new RestrictionContainer();
    let rejectedRestrictionsRight = new RestrictionContainer();

    let leftChoosenSets = [];
    let rightChoosenSets = [];
    let middleChoosenSets = [];

    if (!intersecaoAtiva) {
        // TODO: adapt new code to the first levels
        // TODO: enforce restriction be accepted
        // níveis iniciais, eles devem ter somente uma classe de restrição que deve sempre ser aceita
        let classe = currentStage.acceptedClasses[0];
        let caracteristicasDisponiveis = [...classe];
        let [left, right] = pickRandom(caracteristicasDisponiveis, 2);
        acceptedRestrictionsLeft.insert(classe, left);
        acceptedRestrictionsRight.insert(classe, right);


        // random control
        currentStage.randomLimits.delete(classe);
        let leftSet = new RestrictionSetContainer().add(classe, left),
            rightSet = new RestrictionSetContainer().add(classe, right);

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

        // definir qual caixa é a menor (tem menos restrições)
        if (Math.random() < 0.5) {
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

        greedy algorithm to distribute restrictions:
            1. Insert ONE_SIDE rejected restrictions:
                Insert these restrictions first because they have the most rigid distribution.
                ONE_SIDE.NO_ACCEPTED and ONE_SIDE.WITH_ACCEPETD will put rejQty restrictions on a single box, but ONE_SIDE.WITH_ACCEPTED will add a accepted restriction on the other box too.
                There's no difference in handling ONE_SIDE.NO_ACCEPTED and ONE_SIDE.WITH_ACCEPTED because both have this rigid restriction.
            2. INSERT BOTH_SIDE rejected restrictions:
                These restrictions are less rigid than ONE_SIDE restrictions, but at least one restriction on each box is required (if this isn't enforced, it may become ONE_SIDE.NO_ACCPTED).
            3. Insert accepted restrictions:
                These restrictions have no rigid distribution, so they can be inserted anywhere.
            
        This algotithm tries to distribute the restrictions as closely as possible to the boxesRatio.
        This order was choosen because restrictions in 1 are very rigid (all to be inserted on a single box) and can throw off the ratio.
        With the more flexible distribution of restrictions in 2 and 3, we can distribute to try to get closer to the ratio.

        */

        // decide who will fix bad distributions
        // restrictions ACCEPTED and ONE_SIDE.NO_ACCEPTED needs to have a restriction of a different class in the other box
        // restrictions ONE_SIDE.WITH_ACCEPTED needs to have a restriction of a different class in the same box
        // restrictions BOTH_SIDE doesn't need anything
        let oswaToFix = false,
            osnaToFix = false,
            //bsToFix = false, // not needed as BOTH_SIDES fixes everything automatically
            accToFix = false;
        
        let bothNonZeroFix = false,
            oswaFix = false;

        let oswaRejOnSmallerBox = false,
            oswaRejOnBiggerBox = false;

        if (currentStage.acceptedClasses.length > 0) {
            bothNonZeroFix = true;
            accToFix = true;
        } else if (currentStage.rejectedClasses[BOTH_SIDES].length > 0) {
            //bsToFix = true;
        } else if (currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED].length > 0) {
            bothNonZeroFix = true;
            osnaToFix = true;
        } else if (currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED].length > 0) {
            oswaFix = true;
            oswaToFix = true;
        }

        // in case of it isn't oswa that'll fix
        if (currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED].length > 0) {
            oswaFix = true;
            bothNonZeroFix = false; // solving oswa will solve bothNonZero
        }
        
        let smallerBoxNumClasses = 0,
            biggerBoxNumClasses = 0;

        // TODO: order ONE_SIDE by the number of restrictions (rejQty)
        if (oswaToFix) {
            let rejClassesEarly = currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED].splice(0, 2);

            for (const [rejClass, rejQty] of rejClassesEarly) {
                let choosenCaracteristics = pickRandom([...rejClass], rejQty + 1);
                let acceptedCaracteristic = choosenCaracteristics.pop();

                if (oswaRejOnSmallerBox) {
                    smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    biggerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // add the accepted restriction on the other box
                    smallerBoxSize += rejQty;
                    biggerBoxSize += 1;
                } else if (oswaRejOnBiggerBox) {
                    biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    smallerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // add the accepted restriction on the other box
                    biggerBoxSize += rejQty;
                    smallerBoxSize += 1;
                } else {
                    // +1 because we're adding the accepted restriction on the other box
                    let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + 1 + rejQty),
                        ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1 + rejQty);
                    
                    // if the ratio after insertion on the smaller box is closer to the boxesRatio, insert on the smaller box
                    if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) <= Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                        smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                        biggerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // add the accepted restriction on the other box
                        smallerBoxSize += rejQty;
                        biggerBoxSize += 1;
                        oswaRejOnSmallerBox = true;
                    } else {
                        biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                        smallerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // add the accepted restriction on the other box
                        biggerBoxSize += rejQty;
                        smallerBoxSize += 1;
                        oswaRejOnBiggerBox = true;
                    }
                }

            }

            smallerBoxNumClasses = biggerBoxNumClasses = 2;
            // not needed
            //bothNonZeroFix = false;
            //oswaFix = false;
        }
        for (const [rejClass, rejQty] of currentStage.rejectedClasses[ONE_SIDE.WITH_ACCEPTED]) {
            let choosenCaracteristics = pickRandom([...rejClass], rejQty + 1);
            let acceptedCaracteristic = choosenCaracteristics.pop();

            // +1 because we're adding the accepted restriction on the other box
            let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + 1 + rejQty),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1 + rejQty);
            
            // if the ratio after insertion on the smaller box is closer to the boxesRatio, insert on the smaller box
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) <= Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                biggerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // add the accepted restriction on the other box
                smallerBoxSize += rejQty;
                biggerBoxSize += 1;
                smallerBoxNumClasses++;
                biggerBoxNumClasses++;
                oswaRejOnSmallerBox = true;
            } else {
                biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                smallerBoxAccepted.insert(rejClass, acceptedCaracteristic);  // add the accepted restriction on the other box
                biggerBoxSize += rejQty;
                smallerBoxSize += 1;
                smallerBoxNumClasses++;
                biggerBoxNumClasses++;
                oswaRejOnBiggerBox = true;
            }
        }

        if (oswaRejOnBiggerBox && oswaRejOnSmallerBox) {
            oswaFix = false;
            bothNonZeroFix = false;
        }
        

        if (osnaToFix) {
            if (bothNonZeroFix) {
                const [rejClass, rejQty] = currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED].shift();
                let choosenCaracteristics = pickRandom([...rejClass], rejQty);
                if (smallerBoxSize === 0) {
                    smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    smallerBoxSize += rejQty;
                    smallerBoxNumClasses++;
                } else {
                    biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    biggerBoxSize += rejQty;
                    biggerBoxNumClasses++;
                }
            } else if (oswaFix) {
                const [rejClass, rejQty] = currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED].shift();
                let choosenCaracteristics = pickRandom([...rejClass], rejQty);

                if(oswaRejOnSmallerBox) {
                    smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    smallerBoxSize += rejQty;
                    smallerBoxNumClasses++;
                } else { // if oswaRejOnBiggerBox
                    biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                    biggerBoxSize += rejQty;
                    biggerBoxNumClasses++;
                }
            }
        }
        for (const [rejClass, rejQty] of currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED]) {
            let choosenCaracteristics = pickRandom([...rejClass], rejQty);
            let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + rejQty),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + rejQty);

            // if the ratio after insertion on the smaller box is closer to the boxesRatio, insert on the smaller box
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) <= Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                smallerBoxSize += rejQty;
                smallerBoxNumClasses++;
            } else {
                biggerBoxRejected.insert(rejClass, ...choosenCaracteristics);
                biggerBoxSize += rejQty;
                biggerBoxNumClasses++;
            }
        }

        //if (bsToFix) {
        //* not needed as BOTH_SIDES fixes everything automatically
        //}
        for (const [rejClass, rejQty] of currentStage.rejectedClasses[BOTH_SIDES]) {
            let choosenCaracteristics = pickRandom([...rejClass], rejQty);
            // first add one rejected restriction on each box (needed to not become ONE_SIDE.NO_ACCEPTED by the greedy algorithm)
            let smallerCaracteristic = choosenCaracteristics.pop(),
                biggerCaracteristic = choosenCaracteristics.pop();
            smallerBoxRejected.insert(rejClass, smallerCaracteristic);
            biggerBoxRejected.insert(rejClass, biggerCaracteristic);
            smallerBoxSize += 1;
            biggerBoxSize += 1;

            // TODO: calculate how many restrictions can be inserted on each box instead of deciding where to insert for each restriction
            for (const caracteristic of choosenCaracteristics) {
                // insert each caracteristic one at a time to try to get closer to the boxesRatio
                let ratioIfInsertOnSmaller = (smallerBoxSize + 1) / (smallerBoxSize + biggerBoxSize + 1),
                    ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1);
                // if the ratio after insertion on the smaller box is closer to the boxesRatio, insert on the smaller box
                if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) <= Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                    smallerBoxRejected.insert(rejClass, caracteristic);
                    smallerBoxSize += 1;
                    smallerBoxNumClasses++;
                } else {
                    biggerBoxRejected.insert(rejClass, caracteristic);
                    biggerBoxSize += 1;
                    biggerBoxNumClasses++;
                }
            }

            bothNonZeroFix = false;
            oswaFix = false;
        }

        // TODO: calculate how many restrictions can be inserted on each box instead of deciding where to insert for each restriction
        if (accToFix) {
            if (smallerBoxSize > 0 && biggerBoxSize > 0)
                bothNonZeroFix = false;

            if (bothNonZeroFix) {
                const accClass = currentStage.acceptedClasses.shift();
                let choosenCaracteristic = [...accClass][Math.floor(Math.random() * accClass.length)];

                if (smallerBoxSize === 0) {
                    smallerBoxAccepted.insert(accClass, choosenCaracteristic);
                    smallerBoxSize += 1;
                    smallerBoxNumClasses++;
                } else {
                    biggerBoxAccepted.insert(accClass, choosenCaracteristic);
                    biggerBoxSize += 1;
                    biggerBoxNumClasses++;
                }
            } else if (oswaFix) {
                const accClass = currentStage.acceptedClasses.shift();
                let choosenCaracteristic = [...accClass][Math.floor(Math.random() * accClass.length)];

                if (oswaRejOnSmallerBox) {
                    smallerBoxAccepted.insert(accClass, choosenCaracteristic);
                    smallerBoxSize += 1;
                    smallerBoxNumClasses++;
                } else { // if oswaRejOnBiggerBox
                    biggerBoxAccepted.insert(accClass, choosenCaracteristic);
                    biggerBoxSize += 1;
                    biggerBoxNumClasses++;
                }
            }
        }
        for (const accClass of currentStage.acceptedClasses) {
            let choosenCaracteristic = [...accClass][Math.floor(Math.random() * accClass.length)];
            let ratioIfInsertOnSmaller = (smallerBoxSize + 1) / (smallerBoxSize + biggerBoxSize + 1),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1);

            // if the ratio after insertion on the smaller box is closer to the boxesRatio, insert on the smaller box
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) <= Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxAccepted.insert(accClass, choosenCaracteristic);
                smallerBoxSize += 1;
                smallerBoxNumClasses++;
            } else {
                biggerBoxAccepted.insert(accClass, choosenCaracteristic);
                biggerBoxSize += 1;
                biggerBoxNumClasses++;
            }
        }

        let leftSets = [];
        let rightSets = [];
        let middleSets = [];
        // generate the subsets that exist on each side
        {
            let leftRestrictions = acceptedRestrictionsLeft.concat(rejectedRestrictionsLeft);
            let rightRestrictions = acceptedRestrictionsRight.concat(rejectedRestrictionsRight);
            let leftUnspecifiedClasses = [...CARACTERISTIC].filter(c => leftRestrictions.arr[c.id].length === 0);
            let rightUnspecifiedClasses = [...CARACTERISTIC].filter(c => rightRestrictions.arr[c.id].length === 0);
            let leftPossibilities = leftRestrictions.arr.flatMap(arr => arr.map(caracteristic => [[caracteristic, ACCEPTED], [caracteristic, REJECTED]]));
            let rightPossibilities = rightRestrictions.arr.flatMap(arr => arr.map(caracteristic => [[caracteristic, ACCEPTED], [caracteristic, REJECTED]]));

            // generate all possible combinations of restrictions

            let fullSet = new RestrictionSetContainer().invert();

            for (const comb of cartesianProduct(...leftPossibilities)) {
                let set = fullSet; // no worry about mutating the fullSet, set will be replaced by a modified copy of it
                for (const [caracteristic, accepted] of comb) {
                    // TODO: maybe include class inside of comb?
                    let classe = CARACTERISTIC.getClass(caracteristic);
                    let currentSet = new RestrictionSetContainer();
                    currentSet.add(classe, caracteristic);
                    if (accepted === REJECTED) 
                        currentSet = currentSet.invert(classe);
                    set = set.intersection(currentSet, classe);
                }
                leftUnspecifiedClasses.forEach(classe => set.add(classe, ...classe));
                // TODO: maybe move this to inside of the previous loop?
                if (set.anyEmpty()) {
                    // no shapes in this set
                    continue;
                }
                leftSets.push(set);
            }

            for (const comb of cartesianProduct(...rightPossibilities)) {
                let set = fullSet; // no worry about mutating the fullSet, set will be replaced by a modified copy of it
                for (const [caracteristic, accepted] of comb) {
                    let classe = CARACTERISTIC.getClass(caracteristic);
                    let currentSet = new RestrictionSetContainer();
                    currentSet.add(classe, caracteristic);
                    if (accepted === REJECTED) 
                        currentSet = currentSet.invert(classe);
                    
                    set = set.intersection(currentSet, classe);
                }
                rightUnspecifiedClasses.forEach(classe => set.add(classe, ...classe));
                if (set.anyEmpty()) {
                    // no shapes in this set
                    continue;
                }
                rightSets.push(set);
            }

            // intersect combinations with a side to get possible sets for that side

            // leftWithRightSets = right possibilities <&- left restrictions
            // so this are the sets that are subsets of the left side including the intersection
            let leftWithRightSets = [];
            let rightWithLeftSets = [];

            let leftRestrictionSet = fullSet.clone();
            // TODO: optimize this shit! (virtual goes nice here)
            acceptedRestrictionsLeft.arr.forEach((arr, i) => {
                if (arr.length !== 0)
                    leftRestrictionSet.set(CARACTERISTIC[i], ...arr);
            });
            rejectedRestrictionsLeft.arr.forEach((arr, i) => {
                arr.forEach(caracteristic => {
                    let set = RestrictionSetContainer();
                    set.add(CARACTERISTIC[i], caracteristic);
                    leftRestrictionSet = leftRestrictionSet.intersection(set.invert(CARACTERISTIC[i]), CARACTERISTIC[i]);
                });
            });
            //leftUnspecifiedClasses.forEach(c => leftRestrictionSet.add(c, ...c));
            let rightRestrictionSet = fullSet.clone();
            acceptedRestrictionsRight.arr.forEach((arr, i) => {
                if (arr.length !== 0)
                    rightRestrictionSet.set(CARACTERISTIC[i], ...arr);
            });
            rejectedRestrictionsRight.arr.forEach((arr, i) => {
                arr.forEach(caracteristic => {
                    let set = new RestrictionSetContainer();
                    set.add(CARACTERISTIC[i], caracteristic);
                    rightRestrictionSet = rightRestrictionSet.intersection(set.invert(CARACTERISTIC[i]), CARACTERISTIC[i]);
                });
            });
            //rightUnspecifiedClasses.forEach(c => rightRestrictionSet.add(c, ...c));

            for (const rightSet of rightSets) {
                let intersection = rightSet.intersection(leftRestrictionSet);
                if (intersection.anyEmpty()) {
                    // no shapes in this set
                    continue;
                }
                leftWithRightSets.push(intersection);
            }

            for (const leftSet of leftSets) {
                let intersection = leftSet.intersection(rightRestrictionSet);
                if (intersection.anyEmpty()) 
                    continue;
                
                rightWithLeftSets.push(intersection);
            }

            // generate intersection set
            let middleSet = new RestrictionSetContainer();
            {
                let set = fullSet;
                let leftComb = [].concat(
                    acceptedRestrictionsLeft.arr.flatMap(arr => arr.map(caracteristic => [caracteristic, ACCEPTED])),
                    rejectedRestrictionsLeft.arr.flatMap(arr => arr.map(caracteristic => [caracteristic, REJECTED]))
                );
                for (const [caracteristic, accepted] of leftComb) {
                    let classe = CARACTERISTIC.getClass(caracteristic);
                    let currentSet = new RestrictionSetContainer();
                    currentSet.add(classe, caracteristic);
                    if (accepted === REJECTED) 
                        currentSet = currentSet.invert(classe);
                    set = set.intersection(currentSet, classe);
                }
                leftUnspecifiedClasses.forEach(classe => set.add(classe, ...classe));
                if (set.anyEmpty()) {
                    // no shapes in this set
                    console.error('!PANIC! no shapes in the intersection possibility set!');
                }

                let intersection = set.intersection(rightRestrictionSet);
                if (intersection.anyEmpty()) 
                    console.error('!PANIC! no shapes in the intersection set!');
                set = intersection;
                middleSet = set;
            }

            // remove intersection set from left and right sets
            //leftSets = leftWithRightSets.filter(s => !middleSet.equals(s));
            leftWithRightSets.splice(leftWithRightSets.findIndex((set) => middleSet.equals(set)), 1);
            leftSets = leftWithRightSets;
            //rightSets = rightWithLeftSets.filter(s => !middleSet.equals(s));
            rightWithLeftSets.splice(rightWithLeftSets.findIndex((set) => middleSet.equals(set)), 1);
            rightSets = rightWithLeftSets;


            // generate all "simple" sets for all sides
            leftSets = leftSets.flatMap(s => s.toSingleSubsets());
            rightSets = rightSets.flatMap(s => s.toSingleSubsets());
            middleSets = middleSet.toSingleSubsets();
        }

        // random limits
        let limit = [
            currentStage.randomLimits.get(CARACTERISTIC.SHAPE),
            currentStage.randomLimits.get(CARACTERISTIC.COLOR),
            currentStage.randomLimits.get(CARACTERISTIC.SIZE),
            currentStage.randomLimits.get(CARACTERISTIC.OUTLINE)
        ];
        // calculate minima
        let minimumConfig, minimumSet;
        {
            let possibleConfigurations = []; // [[result_set, [left, middle, right]], ...]
            for (const [leftSet, middleSet, rightSet] of cartesianProduct(leftSets, middleSets, rightSets)) {
                let set = new RestrictionSetContainer();
                set = set.union(leftSet);
                set = set.union(middleSet);
                set = set.union(rightSet);
                possibleConfigurations.push([set, [leftSet, middleSet, rightSet]]);
            }

            console.log('[i] {CALCULATE MINIMA} possible configurations: ' + possibleConfigurations.length);
            // "normalize" the limit vector (for dot product)
            // src: https://github.com/stackgl/gl-vec3/blob/master/normalize.js
            let limitNorm = Array(4);
            {
                let x = limit[0],
                    y = limit[1],
                    z = limit[2],
                    w = limit[3];
                let len = x*x + y*y + z*z + w*w;
                if (len > 0) {
                    len = 1 / Math.sqrt(len);
                    limitNorm[0] = limit[0] * len;
                    limitNorm[1] = limit[1] * len;
                    limitNorm[2] = limit[2] * len;
                    limitNorm[3] = limit[3] * len;
                }
            }

            console.log('[i] {CALCULATE MINIMA} defined random limit: ' + limit);

            let minConfig = null;
            let minSum = Infinity;
            let minDot = Infinity;

            for (const [set, comb] of possibleConfigurations) {
                let a = set;
                a = a.arr.map(s => s.length);
                let aSum = a.reduce((acc, cur) => acc + cur, 0);

                if (aSum >= minSum)
                    continue;

                let x = a[0],
                    y = a[1],
                    z = a[2],
                    w = a[3];
                let len = x*x + y*y + z*z + w*w;
                if (len > 0) {
                    len = 1 / Math.sqrt(len);
                    a[0] *= len;
                    a[1] *= len;
                    a[2] *= len;
                    a[3] *= len;
                }
                let aDot = a[0] * limitNorm[0] + a[1] * limitNorm[1] + a[2] * limitNorm[2] + a[3] * limitNorm[3];
                aDot = (1 - aDot);

                if (aDot >= minDot)
                    continue;

                // it's smaller than the current minimum
                minConfig = [set, comb];
                minSum = aSum;
                minDot = aDot;
            }

            // TODO: look, we just need to do this shit for the specified classes, cut this shit down
            console.log('[i] {CALCULATE MINIMA} minima: ' + JSON.stringify(minConfig[0].arr.map(s => [...s])));
            minimumSet = minConfig[0];
            minimumConfig = minConfig[1];
        }

        leftChoosenSets = [minimumConfig[0]];
        middleChoosenSets = [minimumConfig[1]];
        rightChoosenSets = [minimumConfig[2]];

        let currentRestrictions = minimumSet;

        //TODO: skip shit if smaller than limit
        if (zipArr(minimumSet.arr.map(c => c.length), limit).some(([a, b]) => a > b)) {
            console.warn('Minima is larger than the limit. Limit isn\'t reasonable, setting minima to limit.');
            console.info(`Minima was: ${minimumSet.arr.map(c => c.length)}`);
            limit = minimumSet.arr.map(c => c.length);
        } else {
            // fill to limit, maximizing chaos

            // remove the already choosen sets from the possible sets
            leftSets.splice(leftSets.indexOf(minimumConfig[0]), 1);
            middleSets.splice(middleSets.indexOf(minimumConfig[1]), 1);
            rightSets.splice(rightSets.indexOf(minimumConfig[2]), 1);

            /*
            greedy algo wheee:
            This is like the Multi-dimensional knapsack problem, but dynamic!

            So here's the problem:
            We have N sets (leftSets + middleSets + rightSets) and we have to choose a combination of them
            trying to pick the biggest amount of sets while keeping currentRestrictions smaller or equal than "limit".

            Every set has a weight, which is the amount of restrictions it adds to currentRestrictions.
            Since a set and current restrictions may have an intersection, the weight is not the same as the number of restrictions of that set.

            The profit of a set is the sum of the reduction of the weight of the other sets AND the dot product of this reduction in relation to "limit".
            Since choosing a set changes the weight of the other sets, these weights will decrease (this is why it's dynamic).
            This reduction is part of the profit and the biggest it's the better.
            However multiple sets can have the same "reduction". To tiebreak, we look at the "direction" of these reductions:
                The weights of all sets forms a n-dimensional vector. In case we choose a set, theis vector will change, becoming smaller.
                This change is also a n-dimensional vector. In case of the same number of reductions, which vector would be better?
                The best diff vector (original vector - new vector) is the one that follow the "spirit" (or proprotions) of the limit.
                So, the more parallel a diff vector is to -limit (since limit is positive) the better!
                TODO: ^ it's not -limit

                This means if the limit is [4, 2] and there's two options of sets each with a diff vector of [-3, 0] and [-2,-1] we choose the latter,
                since it's parallel to -limit. This means that when we can't add sets anymore (because adding any of the remaining will surpass the limit),
                we'll have "usage" "closer" to limit on all components. With the limit of [4, 3], it's better that usage is [3, 2] than [4, 1]. Not just
                the first usage is closer to limit and also more parallel, but its number of combinations is bigger (3x2=6 vs 4x1=4). This helps maximize
                chaos in the generation
                

            Since every time we choose a set, the reduction of the wheight of all remaining vectors change, this problem is dynamic. This makes the problem
            significantly harder. This greedy algo may not be optimal, but it's probably the best choice. Dynamic Programming can't be apllied here because
            the dynamicity causes poor (or non existant) subproblem overlapping.
            So intead of sorting the sets and choosing the first ones, we'll choose the set with the max profit/weight ratio and then
            recalculate the new reductions, choose the max/min set and so on, until we can't add any set to our solution that would surpass the limit.

            Oh, one thing: we have to identify each set if we merge all of then in a single array, so they can be added to the correct side.

            So the algo:
            1. Merge the arrays of sets into one, identifying from where they come from.
            2. Calculate the weights of sets (original vector)
            3. Calculate the profit and weight for every set and choose the max profit/weight ratio
               The minimum is choosen first on sum of reductions/weight (or inverse) and if it's equal, choose the smaller dot product with limit (the "spirit")
            4. If the addition of the min/max set surpasses limit, bail out, we finished here
            5. Remove that set from the array
            6. Reuse the new weight of sets from the min/max set
            7. If we still have sets to choose, GOTO 3, else finish


            TODO: OPTIMIZATIONS possible here:
            - If the limit for a class is 1, we can't add any sets that have a restriction for this class that is different from what is choose for the
              minima already. So we can remove all sets that doesn't contain the restriction choosen for that class on the minima
            - If the limit for a class is MAX, then we can ignore it, removing all restrictions of this classe for all sets (removing duplicates of course).
              We can add these restrictions back later.
              Maybe we can calculate a dynamic max. For example, if one side is NO TRIANGLE and the other is SQUARE, triangles can't appear. Can we do something with this?
            */
            {
                let allSets = [...leftSets.map(s => [leftChoosenSets, s]),
                               ...rightSets.map(s => [rightChoosenSets, s]),
                               ...middleSets.map(s => [middleChoosenSets, s])];
                let weightsConfig = allSets.map(([_, s]) => s.subtract(currentRestrictions));
                let weights = weightsConfig.map(c => c.size());
                // TODO: maybe we should use vectors as weights instead of a single value? Following the same logic as the profit, trying to get something more "aligned" to limit. All ops would probably be dot products.

                // "normalize" the limit vector (for dot product)
                // src: https://github.com/stackgl/gl-vec3/blob/master/normalize.js
                let limitNorm = Array(4);
                {
                    let x = limit[0],
                        y = limit[1],
                        z = limit[2],
                        w = limit[3];
                    let len = x*x + y*y + z*z + w*w;
                    if (len > 0) {
                        len = 1 / Math.sqrt(len);
                        limitNorm[0] = limit[0] * len;
                        limitNorm[1] = limit[1] * len;
                        limitNorm[2] = limit[2] * len;
                        limitNorm[3] = limit[3] * len;
                    }
                }

                while(allSets.length !== 0) {
                    let maxSet, maxSetSide;
                    // -Infinity/0 = -Infinity, so any ratio here will be bigger on the first iteration
                    let maxSetWeight = 0,
                        maxSetDiffSum = -Infinity,
                        maxSetDiffDot = -Infinity;
                    let maxSetWeightsConfig, maxSetWeights;
                    for (const [i, [side, set]] of allSets.entries()) {
                        let setWeight = weights[i];

                        // calculate profit
                        let setWeightsConfigs = weightsConfig.map(s => s.subtract(set));
                        let setWeights = setWeightsConfigs.map(c => c.size());

                        // diffVec = weights - setWeights (vector operation)
                        let diffVec = zipArr(weights, setWeights).map(([a, b]) => a - b);

                        let diffSum = diffVec.reduce((a, b) => a + b, 0);
                        if (diffSum/setWeight <= maxSetDiffSum/maxSetWeight) continue;

                        // calculate dot product
                        // normalize the diffVec (for dot product)
                        let diffVecNorm = Array(4);
                        {
                            let x = diffVec[0],
                                y = diffVec[1],
                                z = diffVec[2],
                                w = diffVec[3];
                            let len = x*x + y*y + z*z + w*w;
                            if (len > 0) {
                                len = 1 / Math.sqrt(len);
                                diffVecNorm[0] = diffVec[0] * len;
                                diffVecNorm[1] = diffVec[1] * len;
                                diffVecNorm[2] = diffVec[2] * len;
                                diffVecNorm[3] = diffVec[3] * len;
                            }
                        }

                        let diffDot = zipArr(diffVecNorm, limitNorm).reduce((a, b) => a + b[0] * b[1], 0);
                        if (diffDot/setWeight <= maxSetDiffDot/maxSetWeight) continue;

                        // we found a new max
                        maxSet = set;
                        maxSetSide = side;
                        maxSetWeight = setWeight;
                        maxSetDiffSum = diffSum;
                        maxSetDiffDot = diffDot;
                        maxSetWeightsConfig = setWeightsConfigs;
                        maxSetWeights = setWeights;
                    }

                    // if add the min set and we surpass the limit, we're done
                    // the same as if any component (class) of currentRestriction is bigger than the limit
                    if (currentRestrictions.union(maxSet).arr.some((v, i) => v > limit[i])) break;

                    // add the min set to the solution
                    maxSetSide.push(maxSet);
                    currentRestrictions = currentRestrictions.union(maxSet);
                    // remove the min set from the array
                    allSets.splice(allSets.findIndex(([_, s]) => s === maxSet), 1);
                    // reuse the new weights
                    weightsConfig = maxSetWeightsConfig;
                    weights = maxSetWeights;
                }
            }
        }
    }


    // WIP: okay now we have the sets that compose each box
    // now pick the shapes for each box!

    // gerar as formas em cada caixa
    let caixaEsquerdaItems = gerarFormas2(leftChoosenSets);
    let caixaIntersecaoItems = gerarFormas2(middleChoosenSets);
    let caixaDireitaItems = gerarFormas2(rightChoosenSets);

    // WIP: how do we limit the num of shapes, following a normal distribution while having a minimum of 1 shape per box and a total of maxNumShapes?

    // limit the amount of shapes maintaining the ratio
    {
        let maxLengths = [[caixaEsquerdaItems,   Math.round(currentStage.maxNumShapes/3)],
                          [caixaIntersecaoItems, Math.round(currentStage.maxNumShapes/3)],
                          [caixaDireitaItems,    Math.round(currentStage.maxNumShapes/3)]];
        maxLengths.sort(([box1, _1], [box2, _2]) => box1.length - box2.length);
        // smaller box gets more limit (ignore intersection)
        maxLengths[1][1] = currentStage.maxNumShapes - Math.round(currentStage.maxNumShapes/3 * 2);
        if (maxLengths[0][0].length < maxLengths[0][1]) {
            // a box has too litle, special limitation will be done
            let maxToBeRedistributed = currentStage.maxNumShapes;
            let minLength = maxLengths[1][0].length;
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

    // DONE!


    // colocar as repostas nas referências globais para ser usado na checagem da resposta
    let respostasCertasEsquerda = new Set([...acceptedRestrictionsLeft.get().flat().map(caracteristica => [caracteristica, ACCEPTED]),
                                           ...rejectedRestrictionsLeft.get().flat().map(caracteristica => [caracteristica, REJECTED])]);
    let respostasCertasDireita = new Set([...acceptedRestrictionsRight.get().flat().map(caracteristica => [caracteristica, ACCEPTED]),
                                          ...rejectedRestrictionsRight.get().flat().map(caracteristica => [caracteristica, REJECTED])]);
    

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
    regrasNaoUsadas = todasCaracteristicas.map(_ => (1 << ACCEPTED) || (1 << REJECTED)) // obtem todas as regras possíveis
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
    respostasItems = respostasItems.concat(regrasNaoUsadas).slice(0, currentStage.maxNumOptions);
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
    respostasItems.map(item => {
        imgTag = document.createElement("img");
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
        imgTag = document.createElement("img");
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
        imgTag = document.createElement("img");
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
        imgTag = document.createElement("img");
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
