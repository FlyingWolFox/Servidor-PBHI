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
        ['restricaoAlt', ['azuis', 'vermelhas', 'amarelas'], ['triângulos', 'quadrados', 'retângulos', 'círculos'], ['grandes', 'pequenas'], [    'contorno',     'contorno']],
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
        if (regra == CARACTERISTIC.OUTLINE.NOTOUTLINED)
            return 'Não podem peças que não tem contorno';
        else if (regra == CARACTERISTIC.OUTLINE.OUTLINED)
            return 'Podem peças que tem contorno';
        else
            return `${aceita ? 'P' : 'Não p'}odem peças que são ${cEnum[regra].restricaoAlt}`;
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

function setDifference(setA, setB) {
    const _difference = new Set(setA);
    for (const elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}

// TODO: replace with a better implementation
function setIntersection(setA, setB) {
    const _intersection = new Set();
    for (const elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function setUnion(setA, setB) {
    const _union = new Set(setA);
    for (const elem of setB) {
        _union.add(elem);
    }
    return _union;
}

function shuffleArray(array) {
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Gera formas para uma caixa de forma dijunta, ou seja, formas geradas aqui pertencem somente a essa caixa, não a outra caixa ou a interseção das duas.
 * Comportamento com casos específicos (Em suma, rejeições tem prioridade e rejeições da outra caixa são ignoradas):
 * - Quando uma característica é aceita na outra caixa, ela é considerada rejeitada nessa caixa
 * - Se uma característica é aceita em ambas as caixas, ela é considerada rejeitada (a geração de formas é dijunta)
 * - Se nas restrições dessa caixa há uma característica que é aceita e rejeitada ao mesmo tempo, a característica é considerada rejeitada
 * - Se nas restrições da outra caixa há uma característica que é aceita e rejeitada ao mesmo tempo, a característica é considerada rejeitada
 * @param {Array<Number, boolean>[]} restricoesNessaCaixa Array de restrições para essa caixa (formato [[CARACTERISTICA, ACCEPTED/REJECTED], ...]. Ex: [[CARACTERISTIC.COLOR.BLUE, ACCEPTED]]
 * @param {Array<Number, boolean>[]} restricoesNoutraCaixa Array de restrições para a outra caixa
 * @param {boolean} intersecaoAtiva Indica se a geração deve levar em conta a existência da caixa de interseção
 * @param {Number} maxNumFormas O máximo de formas que podem ser geradas para todas as caixas
 * @param {Number} minRazaoFormas A razão mínima do número máximo de formas que devem ser geradas para uma caixa
 * @param {Object<Object, boolean>} parametrosAleatorio Parametros para a geração aleatória de formas (formato {CARACTERISTICA: MAXIMA QUANTIDADE DE FORMAS COM ESSA CARACTERISTICA, ...})
 * @param {Number[]} [numFormasEscolhidasParaCaixas] A quantidade de formas geradas para outras caixas (controla a quantidade máxima de formas geradas para essa caixa)
 * @returns {Object<Number, Number>[]} Array contendo as peças geradas para essa caixa (formato [{CLASSE_CARACTERISTICA: CARACTERISTICA, ...}, ...])
 */
function gerarFormas(restricoesNessaCaixa, restricoesNoutraCaixa, intersecaoAtiva, maxNumFormas, minRazaoFormas, parametrosAleatorio, numFormasEscolhidasParaCaixas) {
    "use strict";
    if (numFormasEscolhidasParaCaixas === null) numFormasEscolhidasParaCaixas = [];

    let numFormasParaGerar;
    // calcular o número de formas que podem ser geradas sem deixar as outras caixas abaixo do mínimo
    // número de formas a serem geradas têm que estar entre minRazaoFormas e o máximo que se pode gerar sem deixar as outras caixas abaixo do mínimo
    {
        let min = maxNumFormas * minRazaoFormas,
            max = maxNumFormas * (1 - minRazaoFormas * (intersecaoAtiva ? 2 : 1));

        // calcula quanto as outras caixas passaram do mínimo
        let postMinOtherBoxesSum = numFormasEscolhidasParaCaixas.reduce((previousValue, currentValue) => previousValue + (currentValue - min), 0);

        // diminui o máximo de acordo com o quanto as outras caixas passaram do mínimo
        max -= postMinOtherBoxesSum;
        if (numFormasEscolhidasParaCaixas.length === (intersecaoAtiva ? 2 : 1)) {
            // essa é a última caixa a ser gerada, então tem que completar o número de formas
            min = max;
        }
        numFormasParaGerar = getRandomIntInclusive(min, max);
    }
    let caixaItems = [];
    caixaItems.length = numFormasParaGerar;

    // defina as características que devem ser aceitas e rejeitadas
    let caracteristicasAceitas = new Set(),
        caracteristicasRejeitadas = new Set();

    for (const [caracteristica, aceita] of restricoesNessaCaixa) {
        if (aceita)
            caracteristicasAceitas.add(caracteristica);
        else
            caracteristicasRejeitadas.add(caracteristica);
    }
    for (const [caracteristica, aceita] of restricoesNoutraCaixa) {
        if (aceita)
            // uma característica aceita pela outra caixa tem que ser rejeitada. A geração de formas é dijunta
            caracteristicasRejeitadas.add(caracteristica);
    }

    /*
    Na hora de gerar as formas, há três casos para as caracteristicas:
    1 - A caracteristica é aceita pela restrição:
        Essa característica é forçada em todas as formas geradas e, portanto, todas as formas tem essa característica (como ser da cor azul)
    2 - A caracteristica é rejeitada pela restrição:
        Essa característica é randomizada retirando a possibilidade de ser a característica rejeitada (como não ser um quadrado).
        Como as formas geradas aqui são somente para uma caixa, as suas caracteristicas não podem ser aceitas pela outra restrição, ou teriamos
        uma forma na interseção. A interseção tem sua própria geração de formas, então as características aceitas pela outra caixa tem que ser rejeitadas aqui.
    3 - A caracteristica não é afetada pela restrição
        Essa caracteristica é randomizada

    A randomização é limitada por parametrosAleatorio[CLASSE CARACTERISTICA], que é o número máximo de diferentes características de uma classe que podem ser geradas.
    Exemplo: {[CARACTERISTIC.SHAPE]: 2} significa que só podem ser geradas duas formas diferentes (como quadrado e retângulo)
    */

    // para cada caracteristica, cria um array com todas as possibilidades de caracteristicas
    let caracteristicasRandomChoices = new Map();
    // caso 1
    for (const caracteristica of caracteristicasAceitas) {
        caracteristicasRandomChoices.set(CARACTERISTIC.getClass(caracteristica), [caracteristica]);
    }
    // caso 2
    for (const caracteristica of caracteristicasRejeitadas) {
        let classe = CARACTERISTIC.getClass(caracteristica);
        if (caracteristicasRandomChoices.has(classe) && caracteristicasRandomChoices.get(classe) != caracteristica)
            // se já tiver uma classe aceita, não sobrescreva,
            // exceto se for a mesma caracteristica, pois essa caracteristica é rejeitada por estar na inteserção das caixas
            continue;
        let todasCaracteristicasDaClasse = [...CARACTERISTIC].map(classe => [...classe]).flat();
        let caracteristicasPossiveis = todasCaracteristicasDaClasse.filter(caracteristica => !caracteristicasRejeitadas.has(caracteristica));
        shuffleArray(caracteristicasPossiveis);
        // limita a quantidade de possibilidades de caracteristicas por classe baseando-se em parametrosAleatorio
        // caso uma classe não for especificada em parametrosAleatorio, seu valor é 1
        caracteristicasRandomChoices.set(classe, caracteristicasPossiveis.slice(0, parametrosAleatorio.has(classe) ? parametrosAleatorio.get(classe) : 1)); // caso uma classe não for especificada em random, seu valor é 1
    }
    // caso 3
    // randomiza caracteristicas não afetadas pelas restrições
    // a operação feita aqui é Set(todas as classes) - Set(classes das caracteristicas aceitas + classes das caracteristicas rejeitadas)
    for (const classe of setDifference(
        new Set(CARACTERISTIC), // pega todas as classes
        new Set([].concat(
            [...caracteristicasAceitas].map(caracteristica => CARACTERISTIC.getClass(caracteristica)),
            [...caracteristicasRejeitadas].map(caracteristica => CARACTERISTIC.getClass(caracteristica))
        ))
    )) {
        let todasCaracteristicasDaClasse = [...classe];
        shuffleArray(todasCaracteristicasDaClasse);
        // limita a quantidade de possibilidades de caracteristicas por classe baseando-se em parametrosAleatorio
        // caso uma classe não for especificada em parametrosAleatorio, seu valor é 1
        caracteristicasRandomChoices.set(classe, todasCaracteristicasDaClasse.slice(0, parametrosAleatorio.has(classe) ? parametrosAleatorio.get(classe) : 1));
    }

    // gera as formas
    for (let i = 0; i < caixaItems.length; i++) {
        let forma = new Map();
        for (const [classe, caracteristicas] of caracteristicasRandomChoices.entries()) {
            forma.set(classe, caracteristicas[i % caracteristicas.length]); // percorrer o array de possibilidades de forma circular
        }
        caixaItems[i] = forma;
    }

    return caixaItems;
}

endGame = false;
function game() {
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

    stage_data = [
        {
            restrictionsLeft: [[CARACTERISTIC.SHAPE.TRIANGLE, ACCEPTED]],  // [CARACTERISTIC, Accepted/Rejected]
            restrictionsRight: [[CARACTERISTIC.SHAPE.SQUARE, ACCEPTED]],
            numOptions: 4,
            numShapes: 3,
            // caracteristics that will be used on the shapes
            random: new Map([[CARACTERISTIC.SHAPE, 3]]),  // [[CARACTERISTIC, quantity]] // TODO: Default 1? // TODO: maybe check this value? If it's bigger than the number of shapes, it will cause an error
            minimumRatio: 1 / 3  // the same of minimum_shapes: 1  // the minimum number of shapes that must be in a restriction (a intersection is also considered)
        },
        {
            restrictionsLeft: [[CARACTERISTIC.SHAPE.TRIANGLE, ACCEPTED]],
            restrictionsRight: [[CARACTERISTIC.SHAPE.SQUARE, ACCEPTED]],
            numOptions: 4,
            numShapes: 6,
            random: new Map([[CARACTERISTIC.SHAPE, 4], [CARACTERISTIC.COLOR, 3], [CARACTERISTIC.SIZE, 2], [CARACTERISTIC.OUTLINE, 2]]),
            minimumRatio: 1 / 3  // the same of minimum_shapes: 2
        },
        {
            restrictionsLeft: [[CARACTERISTIC.SHAPE.TRIANGLE, ACCEPTED], [CARACTERISTIC.COLOR.RED, ACCEPTED], [CARACTERISTIC.SIZE.SMALL, REJECTED]],
            restrictionsRight: [[CARACTERISTIC.SHAPE.SQUARE, ACCEPTED], [CARACTERISTIC.OUTLINE.OUTLINED, ACCEPTED]],
            numOptions: 6,
            numShapes: 10,
            random: new Map([[CARACTERISTIC.SHAPE, 4], [CARACTERISTIC.COLOR, 3], [CARACTERISTIC.SIZE, 2], [CARACTERISTIC.OUTLINE, 2]]),
            minimumRatio: 1 / 5  // the same of minimum_shapes: 2
        },
        {
            restrictionsLeft: [[CARACTERISTIC.SHAPE.TRIANGLE, ACCEPTED], [CARACTERISTIC.COLOR.RED, ACCEPTED], [CARACTERISTIC.SIZE.SMALL, REJECTED]],
            restrictionsRight: [[CARACTERISTIC.SHAPE.SQUARE, ACCEPTED], [CARACTERISTIC.COLOR.RED, ACCEPTED], [CARACTERISTIC.OUTLINE.OUTLINED, ACCEPTED]],
            numOptions: 6,
            numShapes: 12,
            random: new Map([[CARACTERISTIC.SHAPE, 4], [CARACTERISTIC.COLOR, 3], [CARACTERISTIC.SIZE, 2], [CARACTERISTIC.OUTLINE, 2]]),
            minimumRatio: 1 / 3  // the same of minimum_shapes: 4
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

    let currentStage = stage_data[etapaAtual % stage_data.length];
    let intersecaoAtiva = etapaAtual >= 10;
    let caixaEsquerdaItems, caixaDireitaItems, caixaIntersecaoItems = [];

    // gerar as formas em cada caixa
    caixaEsquerdaItems = gerarFormas(currentStage.restrictionsLeft, currentStage.restrictionsRight, intersecaoAtiva, currentStage.numShapes, currentStage.minimumRatio, currentStage.random, []);
    caixaDireitaItems = gerarFormas(currentStage.restrictionsRight, currentStage.restrictionsLeft, intersecaoAtiva, currentStage.numShapes, currentStage.minimumRatio, currentStage.random, [caixaEsquerdaItems.length]);
    if (intersecaoAtiva)
        // a interseção tem as restrições das duas caixas e, por isso, a "outra caixa" da interseção é vazia
        caixaIntersecaoItems = gerarFormas([...currentStage.restrictionsLeft, ...currentStage.restrictionsRight], [], intersecaoAtiva, currentStage.numShapes, currentStage.minimumRatio, currentStage.random, [caixaEsquerdaItems.length, caixaDireitaItems.length]);

    // adicionar as regras das restrições nas respostas
    let respostasItems = [].concat(currentStage.restrictionsLeft, currentStage.restrictionsRight);
    // gerar regras que são incorretas
    let todasCaracteristicas = [...CARACTERISTIC].map(classe => [...classe]).flat();
    // obter as regras comuns à todos items da interseção
    // se não há interseção, ou seja, interseção está vazia, esse array será vazio
    let regrasItemsIntersecao = intersecaoAtiva ? caixaIntersecaoItems.map(item => new Set(todasCaracteristicas.map(caracteristica => [caracteristica, caracteristica == item[CARACTERISTIC.getClass(caracteristica)] ? ACCEPTED : REJECTED]))) : [];
    let regrasUsadas = [].concat(
                                 // obter as regras comuns à todos items em cada uma das caixas
                                 caixaEsquerdaItems.map(item => new Set(
                                                                        // obtem as restrições de cada forma. Todas as características que a forma possui são aceitas, as que não possui são rejeitadas
                                                                        // (ex: se a forma é quadrada, então a característica quadrado é aceita e as características retângulo, círculo e triângulo são rejeitadas)
                                                                        // o resultado é um conjunto no estilo [[característica, aceito/rejeitado], [característica, aceito/rejeitado], ...]
                                                                        todasCaracteristicas.map(caracteristica => [caracteristica, caracteristica == item.get(CARACTERISTIC.getClass(caracteristica)) ? ACCEPTED : REJECTED])
                                                                       ))
                                                 .concat(regrasItemsIntersecao) // concatena as formas da interseção, já que também fazem parte da caixa esquerda
                                                 .reduce(setIntersection, new Set(todasCaracteristicas)), // obtem a interseção das regras de todas as formas da caixa, retornando um conjunto de todas as regras aplicaveis a essa caixa
                                 caixaDireitaItems.map(item => new Set(
                                                                     todasCaracteristicas.map(caracteristica => [caracteristica, caracteristica == item.get(CARACTERISTIC.getClass(caracteristica)) ? ACCEPTED : REJECTED])
                                                                      ))
                                                 .concat(regrasItemsIntersecao)
                                                 .reduce(setIntersection, new Set(todasCaracteristicas))
                                ).reduce(setUnion, new Set()); // une todas as regras de todas as caixas
    // TODO: maybe use set operations?
    let regrasNaoUsadas = todasCaracteristicas.map(caracteristica => [[caracteristica, ACCEPTED], [caracteristica, REJECTED]]) // obtem todas as regras possíveis
                                              .flat()
                                              .filter(i => !regrasUsadas.has(i));
    shuffleArray(regrasNaoUsadas);

    // completar as respostas com as regras incorretas para respostasItems ter currentStage.numOptions
    respostasItems = respostasItems.concat(regrasNaoUsadas.slice(0, currentStage.numOptions - respostasItems.length));
    shuffleArray(respostasItems);

    /*Containers*/
    let divRespostas = document.getElementById(divRespostasId);
    let divRestricaoEsquerda = document.getElementById(divRestricaoEsquerdaId);
    let divRestricaoDireita = document.getElementById(divRestricaoDireitaId);

    let divCaixaEsquerda = document.getElementById(divCaixaEsquerdaId);
    let divCaixaDireita = document.getElementById(divCaixaDireitaId);
    let divCaixaIntersecao = document.getElementById(divCaixaIntersecaoId);

    //renderizando restrições em "regras disponíveis"
    respostasItems.map(item => {
        imgTag = document.createElement("img");
        imgTag.src = CARACTERISTIC_EXTRA.getRestricaoScr(item);
        imgTag.alt = CARACTERISTIC_EXTRA.getRestricaoAlt(item);
        imgTag.title = imgTag.alt;
        imgTag.classList.add('drag');
        //imgTag.classList.add('game-img');
        //imgTag.classList.add('img-restricao-esquerda');
        divRespostas.appendChild(imgTag);
    });

    caixaEsquerdaItems.forEach(item => {
        imgTag = document.createElement("img");
        imgTag.src = CARACTERISTIC_EXTRA.getFormaSrc(item);
        imgTag.alt = CARACTERISTIC_EXTRA.getFormaAlt(item);
        imgTag.title = imgTag.alt;
        //imgTag.classList.add('drag');
        imgTag.classList.add('game-img');
        imgTag.classList.add(item[CARACTERISTIC.SIZE] == CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
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
        imgTag.classList.add(item[CARACTERISTIC.SIZE] == CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
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
        imgTag.classList.add(item[CARACTERISTIC.SIZE] == CARACTERISTIC.SIZE.SMALL ? 'pequeno' : 'grande');
        //imgTag.classList.add('img-restricao-esquerda');
        divCaixaIntersecao.appendChild(imgTag);
    });

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

    //exibindo imagens ao lado esquerdo da caixa de drop esquerdo
    arrayOpcoesFinal.forEach(el => {
        // divRespostas.appendChild(el);
        divRestricaoEsquerda.appendChild(el);
    });

    arrayOpcoesFinalDois.forEach(el => {
        divRestricaoDireita.appendChild(el);
    });

    background(1);

}

function background(caixas) {

    var dropzoneArea = document.getElementById('dropzone-container');
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

function check() { //Confere se acertou

    let flag1 = 0, flag2 = 0, flag3 = 0, lixo, mov = 0;
    imgMov1 = [];
    imgMov2 = [];
    var imagensDropEsquerdo = document.getElementById(dropEsquerdoId).getElementsByTagName('img');
    var imagensDropIntersecao = document.getElementById(dropIntersecaoId).getElementsByTagName('img');
    var imagensDropDireito = document.getElementById(dropDireitoId).getElementsByTagName('img');
    var imagensGeradas = document.getElementById(divRespostasId).getElementsByTagName('img');
    var textoAcerto = document.getElementById('resultado-jogo');
    var textoErro = document.getElementById('resultadoNegativo-jogo');

    var modalAcerto = document.getElementById("modalAcerto");
    var modalErro = document.getElementById('modalErro');
    var modalFim = document.getElementById('modalFim');

    var btnReiniciar = document.getElementById('botao-restart');
    var botaoOk = document.getElementById('botao-proximo');

    /*Verifica se as caixas estão corretas e se todas as imagens corretas foram movidas */
    flag1 = first(imagensDropEsquerdo, 'n');
    flag3 = third(imagensDropDireito, 'n');


    /* Confere se a imagem não pertence aos dois*/
    if (quantidade != 2) {

        flag2 = first(imagensDropIntersecao, 'n') + third(imagensDropIntersecao, 'n');

        if (imagensDropEsquerdo.length != 0) {

            lixo = third(imagensDropEsquerdo, 's');
            imgMov2.forEach(el => {
                if (el == 0) {
                    flag1++;
                }

            });
        }

        if (imagensDropDireito.length != 0) {

            lixo = first(imagensDropDireito, 's');
            imgMov1.forEach(el => {
                if (el == 0) {
                    flag3++;
                }

            });
        }
    }

    /*confere se ainda há opções*/
    if (imagensGeradas.length != 0) {

        lixo = first(imagensGeradas, 's');
        lixo = third(imagensGeradas, 's');

        /*Analisa as flags.
        Se a flag da determinada imagem for 0, significa que ela está correta e deve ser movida*/
        imgMov1.forEach(el => {

            if (el == 0) {
                mov++;
            }

        });

        imgMov2.forEach(el => {

            if (el == 0) {
                mov++;
            }

        });
    }

    mov = 0;
    [flag1, flag2, flag3] = [0, 0, 0];

    /*Verifica todas as situações de resposta*/
    if (mov != 0) {

        console.warn('n movi todas');
        modalErro.style.display = 'block';
        textoErro.innerText = 'Você ainda não moveu todas as imagens... Tente novamente.';

    } else {
        if (flag1 == 0 && flag2 == 0 && flag3 == 0) {
            if (endGame == false && etapaAtual <= etapaMax) {

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
                            var texto = document.getElementById('texto1');
                            texto.innerHTML = etapaAtual.toString() + "/10";
                            break;
                        case 10:
                            arrayEstrelas[0].setAttribute('src', '../img/estrelas/star1.svg');
                            var texto = document.getElementById('texto1');
                            texto.innerHTML = etapaAtual.toString() + "/10";
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
                            var texto = document.getElementById('texto2');
                            texto.innerHTML = etapaAtual.toString() + "/20";
                            break;
                        case 20:
                            arrayEstrelas[1].setAttribute('src', '../img/estrelas/star1.svg');
                            var texto = document.getElementById('texto2');
                            texto.innerHTML = etapaAtual.toString() + "/20";
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
                            var texto = document.getElementById('texto3');
                            texto.innerHTML = etapaAtual.toString() + "/30";
                            break;
                        case 30:
                            arrayEstrelas[2].setAttribute('src', '../img/estrelas/star1.svg');
                            var texto = document.getElementById('texto3');
                            texto.innerHTML = etapaAtual.toString() + "/30";
                            break;
                        case 31:
                        case 32:
                        case 33:
                        case 34:
                        case 35:
                        case 36:
                        case 37:
                        case 38:
                            var texto = document.getElementById('texto4');
                            texto.innerHTML = etapaAtual.toString() + "/40";
                            break;
                        case 39:
                            arrayEstrelas[3].setAttribute('src', '../img/estrelas/star1.svg');
                            var texto = document.getElementById('texto4');
                            texto.innerHTML = etapaAtual.toString() + "/40";
                            break;
                        default:
                            break;
                    }
                    game();
                    modalAcerto.style.display = 'none';
                };
            }
            else {
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
        } else {

            modalErro.style.display = 'block';
            textoErro.innerText = 'Resposta errada... Tente novamente!';
        }
    }
}

document.body.onload = game();
var botaoResultado = document.getElementById('botao-resultado');
botaoResultado.addEventListener('click', check);
document.addEventListener("dragstart", function (event) {
    console.log('0');
}, false);
