/*
gerar enum aninhado onde os elementos do subenum não possuem o mesmo valor, podendo obter o valor do enum a partir do valor do subenum
o array members vira um objeto que funciona como um enum, ex: TRAIT.SHAPE.SQUARE == 1.25
exemplo de estrutura de enum gerado aqui:
TRAIT = {
  SHAPE: {
    TRIANGLE: 1.0,
    SQUARE: 1.50,
    id: 1, // id do enum, Math.floor(SHAPE.SQUARE) == 1
    length: 2,
    Symbol.iterator: function* // itera [TRIANGLE, SQUARE]
  },
  COLOR: {
    BLUE: 2.0,
    RED: 2.3333333333333335,
    GREEN: 2.6666666666666665,
    id: 2,
    length: 3,
    Symbol.iterator: function*
  },
  length: 2,
  "0": [SHAPE], // reverse lookup
  "1": [COLOR],
  Symbol.iterator: function*   // itera [SHAPE, COLOR]
  getClass: function
  getClassId: function
}
*/
const TRAIT = function () {
    const members = [
        // [ENUM_NAME, ENUM_VALUES]
        ['COLOR', ['BLUE', 'RED', 'YELLOW']],
        ['SHAPE', ['TRIANGLE', 'SQUARE', 'RECTANGLE', 'CIRCLE']],
        ['SIZE', ['BIG', 'SMALL']],
        ['OUTLINE', ['OUTLINED', 'NOTOUTLINED']]
    ];

    let tEnum = {};
    for (let i = 0; i < members.length; i++) {
        const [memberName, memberValues] = members[i];
        tEnum[memberName] = {};
        for (let j = 0; j < memberValues.length; j++)
            tEnum[memberName][memberValues[j]] = i + j / memberValues.length;
        tEnum[memberName].id = i;
        tEnum[memberName].length = memberValues.length;
        // iterate over the traits of a class
        tEnum[memberName][Symbol.iterator] = function* () {
            for (const trait of memberValues)
                yield tEnum[memberName][trait];
        };
        tEnum[i] = tEnum[memberName]; // add reverse lookup
    }
    tEnum.length = members.length;

    // retorna a classe de uma característica
    tEnum.getClass = function (value) {
        const classId = Math.floor(value);
        return tEnum[classId];
    };

    // iterator para iterar sobre as classes de características
    tEnum[Symbol.iterator] = function* () {
        const classes = members.map(([memberName, _]) => memberName);
        for (const className of classes)
            yield this[className];
    };

    return Object.freeze(tEnum);
}();

// igual a TRAIT, mas com outras informações para cada característica
// ex: TRAIT.SHAPE.SQUARE.formaAlt == 'Quadrado'
// é feito para ser acessado com TRAIT, ex: TRAIT_EXTRA[TRAIT.SHAPE.SQUARE].formaAlt == 'Quadrado'
const TRAIT_EXTRA = function () {
    const members = [
        // [ENUM_NAME, ENUM_VALUES]
        ['COLOR', ['BLUE', 'RED', 'YELLOW']],
        ['SHAPE', ['TRIANGLE', 'SQUARE', 'RECTANGLE', 'CIRCLE']],
        ['SIZE', ['BIG', 'SMALL']],
        ['OUTLINE', ['OUTLINED', 'NOTOUTLINED']]
    ];

    // subMembers:
    //  formasSrc: componente do caminho das imagens das formas (ex: triângulo azul, pequeno e com contorno -> 'TZPC.svg)
    //  formasAlt: nome da característica para exibição (ex: triângulo azul, pequeno e com contorno -> 'Triângulo azul, pequeno com contorno')
    //  restricaoSrc: componente do caminho das imagens das restrições (ex: restrição peças azuis -> 'azul-sim.svg')
    //  restricaoAlt: nome da restrição para exibição (ex: restrição peças azuis -> 'Podem peças que são azuis')
    const subMembers = [
        //               [   BLUE,         RED,     YELLOW], [    TRIANGLE,      SQUARE,    RECTANGLE,     CIRCLE], [      BIG,      SMALL], [      OUTLINED,    NOTOUTLINED],
        ['formaSrc',     [    'Z',         'V',        'A'], [         'T',         'Q',          'R',        'C'], [      'G',        'P'], [           'C',            'S']],
        ['formaAlt',     [ 'azul',  'vermelho',  'amarelo'], [ 'Triângulo',  'Quadrado',  'Retângulo',  'Círculo'], [ 'grande',  'pequeno'], ['com contorno', 'sem contorno']],
        ['restricaoSrc', [ 'azul',  'vermelho',  'amarelo'], [ 'triangulo',  'quadrado',  'retangulo',  'circulo'], [ 'grande',  'pequeno'], [    'contorno',  'semContorno']],
        ['restricaoAlt', ['azuis', 'vermelhas', 'amarelas'], ['triângulos', 'quadrados', 'retângulos', 'círculos'], ['grandes', 'pequenas'], ['com contorno', 'sem contorno']],
    ];

    let tEnum = {};

    for (let i = 0; i < members.length; i++) {
        const [memberName, memberValues] = members[i];
        tEnum[memberName] = {};
        for (let j = 0; j < memberValues.length; j++) {
            tEnum[memberName][memberValues[j]] = {};
            for (const subMemberArray of subMembers) {
                const subMemberName = subMemberArray[0];
                // access subMembers, ex TRAIT_EXTRA.SHAPE.SQUARE.formaSrc
                tEnum[memberName][memberValues[j]][subMemberName] = subMemberArray[i + 1][j];
            }
            // lookup with TRAIT
            tEnum[i + j / memberValues.length] = tEnum[memberName][memberValues[j]];
        }
    }

    // retorna o caminho da imagem de uma forma
    tEnum.getFormaSrc = function (forma) {
        return `../img/fig-rosto/${tEnum[forma.get(TRAIT.SHAPE)].formaSrc}${tEnum[forma.get(TRAIT.COLOR)].formaSrc}${tEnum[forma.get(TRAIT.SIZE)].formaSrc}${tEnum[forma.get(TRAIT.OUTLINE)].formaSrc}.svg`;
    };

    // retorna o texto da descrição de uma forma
    tEnum.getFormaAlt = function (forma) {
        return `${tEnum[forma.get(TRAIT.SHAPE)].formaAlt} ${tEnum[forma.get(TRAIT.COLOR)].formaAlt}, ${tEnum[forma.get(TRAIT.SIZE)].formaAlt} e ${tEnum[forma.get(TRAIT.OUTLINE)].formaAlt}.`;
    };

    // retorna o caminho da imagem de uma restrição
    tEnum.getRestricaoScr = function ([regra, aceita]) {
        return `../img/restricoes/${tEnum[regra].restricaoSrc}-${aceita ? 'sim' : 'nao'}.svg`;
    };

    // retorna o texto da descrição de uma restrição
    tEnum.getRestricaoAlt = function ([regra, aceita]) {
        if (TRAIT.getClass(regra) === TRAIT.OUTLINE)
            return `${aceita ? 'Só' : 'Não'} podem peças ${tEnum[regra].restricaoAlt}`;

        return `${aceita ? 'Só' : 'Não'} podem peças que são ${tEnum[regra].restricaoAlt}`;
    };

    return Object.freeze(tEnum);
}();

const [ACCEPTED, REJECTED] = [true, false];

// Constantes de definição de tipo de rejeição
const ONE_SIDE = { // rejeições somente em uma caixa
    NO_ACCEPTED: 0,
    WITH_ACCEPTED: 1 // característica aceita da mesma classe na outra caixa
};
const BOTH_SIDES = 2; // ambas as caixas possuem as rejeições


export { TRAIT, TRAIT_EXTRA, ACCEPTED, REJECTED, ONE_SIDE, BOTH_SIDES};
