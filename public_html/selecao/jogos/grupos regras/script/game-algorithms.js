import { ACCEPTED, BOTH_SIDES, ONE_SIDE, REJECTED, TRAIT } from './game-structures.js';

let currentStage;
let intersecaoAtiva;

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

/**
 * TraitContainer é uma estrutura de dados que armazena as características
 * indexando por classe, possibilitando obter as características de uma classe sem
 * muito trabalho
 */
function TraitContainer() {
    if (!new.target)
        return new TraitContainer();

    // the array of the map
    this.arr = Array.from(Array(TRAIT.length), () => []);
}

/**
 * Insere característica da classe classe no container
 * @param {TRAIT[*]} classe
 * @param  {...TRAIT[*][*]} caracteristicas
 */
TraitContainer.prototype.insert = function (classe, ...caracteristicas) {
    this.arr[classe.id].push(...caracteristicas);
};

/**
 * Retorna as características no container.
 * Method Overload:
 * - get(classe) -> retorna todas as características da classe
 * - get() -> retorna todas as características de todas as classes, num array de uma dimensão
 * @param {TRAIT[*]} classe
 * @returns {TRAIT[*][*][]} Array com as características
 */
TraitContainer.prototype.get = function (classe) {
    if (!classe)
        return this.arr.flat();

    return this.arr[classe.id];
};

/**
 * Concatena dois containers, retornando um novo container. Pode haver caracteristicas repetidas no novo container
 * @param {TraitContainer} other O outro container para concatenar
 * @returns {TraitContainer} Novo array com as características de this e other
 */
TraitContainer.prototype.concat = function (other) {
    let newRestrictions = new TraitContainer();
    for (let i = 0; i < this.arr.length; i++)
        newRestrictions.arr[i] = this.arr[i].concat(other.arr[i]);

    return newRestrictions;
};

/**
 * TraitSetContainer é um TraitContainer, mas que armazena as características
 * em um Set, oferecendo operações com conjuntos e remoção de duplicatas
 */
function TraitSetContainer() {
    if (!new.target)
        return new TraitSetContainer();

    // the array of the map
    this.arr = Array.from(Array(TRAIT.length), () => new Set());
}

/**
 * Insere característica da classe classe no set. Retorna this
 * @param {TRAIT[*]} classe
 * @param  {...TRAIT[*][*]} caracteristicas
 * @returns {TraitSetContainer} this
 */
TraitSetContainer.prototype.add = function (classe, ...caracteristicas) {
    caracteristicas.forEach(caracteristica => this.arr[classe.id].add(caracteristica));
    return this;
};

/**
 * Define as características de uma classe no container, sobrescrevendo as caracteristicas antigas. Retorna this
 * @param {TRAIT[*]} classe
 * @param  {...TRAIT[*][*]} caracteristicas
 * @returns {TraitSetContainer} this
 */
TraitSetContainer.prototype.set = function (classe, ...caracteristicas) {
    this.arr[classe.id] = new Set(caracteristicas);
    return this;
};

/**
 * Retorna as características no container.
 * Method Overload:
 * - get(classe) -> retorna todas as características da classe
 * - get() -> retorna todas as características de todas as classes, num Set
 * @param {TRAIT[*]} classe
 * @returns {Set<TRAIT[*][*]>} Set com as características
 */
TraitSetContainer.prototype.get = function (classe) {
    if (!classe)
        return new Set(this.arr.flatMap(set => [...set]));

    return new Set([...this.arr[classe.id]]);
};

/**
 * Retornar um novo TraitSetContainer contendo a interseção de this e other.
 * Method Overload:
 * - intersect(other) -> retorna a interseção de this e other
 * - intersect(classe, other) -> retorna a interseção de this e other na classe `classe`, com as outras classes sendo igual a this
 * @param {TraitSetContainer} other
 * @param {TRAIT[*]} classe
 * @returns {TraitSetContainer} Novo TraitSetContainer com a interseção
 */
TraitSetContainer.prototype.intersection = function (other, classe) {
    let newSet = new TraitSetContainer();

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
 * Retornar um novo TraitSetContainer contendo a união de this e other.
 * Method Overload:
 * - union(other) -> retorna a união de this e other
 * - union(classe, other) -> retorna a união de this e other na classe `classe`, com as outras classes sendo igual a this
 * @param {TraitSetContainer} other
 * @param {TRAIT[*]} classe
 * @returns {TraitSetContainer} Novo TraitSetContainer com a união
 */
TraitSetContainer.prototype.union = function (other, classe) {
    let newSet = new TraitSetContainer();

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
 * Retornar um novo TraitSetContainer contendo a diferença de this e other.
 * Method Overload:
 * - difference(other) -> retorna a diferença de this e other
 * - difference(classe, other) -> retorna a diferença de this e other na classe `classe`, com as outras classes sendo igual a this
 * @param {TraitSetContainer} other
 * @param {TRAIT[*]} classe
 * @returns {TraitSetContainer} Novo TraitSetContainer com a diferença
 */
TraitSetContainer.prototype.difference = function (other, classe) {
    let newSet = new TraitSetContainer();

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
 * @param {TraitSetContainer} other
 * @param {TRAIT[*]} classe
 * @returns {boolean} Se this é um subconjunto de other
 */
TraitSetContainer.prototype.isSubsetOf = function (other, classe) {
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
 * @param {TraitSetContainer} other
 * @param {TRAIT[*]} classe
 * @returns {boolean} Se this é igual a other
 */
TraitSetContainer.prototype.equals = function (other, classe) {
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
 * Exemplo: se não há nenhuma característica de classe TRAIT.COR no container, retorna true.
 * @returns {boolean} Se há uma classe vazia
 */
TraitSetContainer.prototype.anyEmpty = function () {
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
 * @returns {TraitSetContainer} Novo TraitSetContainer com o inverso de this
 */
TraitSetContainer.prototype.invert = function (classe) {
    let newSet = new TraitSetContainer();

    // if a class is given, invert only that class
    if (typeof classe !== 'undefined') {
        newSet.arr = this.arr.map((set) => new Set(set));
        let allTraits = [...TRAIT[classe.id]];
        newSet.arr[classe.id] = new Set(allTraits.filter((x) => !this.arr[classe.id].has(x)));
        return newSet;
    }

    // if class is not given, invert all classes
    for (const classe of [...TRAIT]) {
        let allTraits = [...TRAIT[classe.id]];
        newSet.arr[classe.id] = new Set(allTraits.filter((x) => !this.arr[classe.id].has(x)));
    }

    return newSet;
};

/**
 * Retorna uma cópia do container.
 * @returns {TraitSetContainer} Cópia do container
 */
TraitSetContainer.prototype.clone = function () {
    let newSet = new TraitSetContainer();
    newSet.arr = this.arr.map((set) => new Set(set));
    return newSet;
};

/**
 * Retorna um array com todos os subconjuntos contendo uma caracteristica de por classe.
 * @param {*} classe
 * @returns
 */
TraitSetContainer.prototype.toSingleSubsets = function (classe) {
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
        let newSet = new TraitSetContainer();
        newSet.arr = comb.map(caracteristica => new Set([caracteristica]));
        subsets.push(newSet);
    }

    return subsets;
};

/**
 * Um conjunto para restrições (características + aceita/rejeita).
 * @param {} shapes Inicializar Set com um array de formas.
 * @returns RestrictionSet
 */
function RestrictionSet(shapes) {
    if (!new.target)
        return new RestrictionSet();

    /*
    Esse set usa um array de bitsets para representar se uma restrição está no conjunto.
    A característica é mapeada no array usando o índice em todasCaracteristicas, usando caracteristicasIndex.
    O valor de cada índice do array é um bitset de 2 bits:
        bit 0 - Rejeição presente no conjunto (1 << REJECTED == 0b01)
        bit 1 - Aceitação presente no conjunto (1 << ACCEPTED == 0b10)

    Exemplo, para a característica TRAIT.SHAPE.SQUARE:
        0b00 - Nenhuma restrição de SQUARE está presente no conjunto
        0b01 - Rejeição de SQUARE ([TRAIT.SHAPE.SQUARE, REJECTED]) está presente no conjunto
        0b10 - Aceitação de SQUARE ([TRAIT.SHAPE.SQUARE, ACCEPTED]) está presente no conjunto
        0b11 - Rejeição e aceitação de SQUARE estão presentes no conjunto
    */

    let todasCaracteristicas = [...TRAIT].flatMap(classe => [...classe]);
    let caracteristicasIndex = function() {
        let obj = Object.create(null);
        todasCaracteristicas.forEach((el, i) => obj[el] = i);
        return obj;
    }();
    this.todasCaracteristicas = todasCaracteristicas;
    this.caracteristicasIndex = caracteristicasIndex;

    if (!shapes) {
        this.arr = Array(this.todasCaracteristicas.length).fill(0);
    } else if (shapes.length === 1) {
        this.arr = Array(this.todasCaracteristicas.length).fill(1 << REJECTED);
        shapes[0].forEach(trait => {
            let i = this.caracteristicasIndex[trait];
            this.arr[i] = 1 << ACCEPTED;
        });

    } else {
        this.arr = Array(this.todasCaracteristicas.length).fill(1 << REJECTED | 1 << ACCEPTED);
        let thisSet = this;
        shapes.forEach(shape => thisSet = thisSet.intersection(new RestrictionSet([shape])));
        this.arr = thisSet.arr;
    }
}

RestrictionSet.prototype.add = function (trait, accepted) {
    let i = this.caracteristicasIndex[trait];
    this.arr[i] |= 1 << accepted;
    return this;
};

RestrictionSet.prototype.set = function (trait, accepted) {
    let i = this.caracteristicasIndex[trait];
    this.arr[i] = 1 << accepted;
    return this;
};

RestrictionSet.prototype.remove = function (trait, accepted) {
    let i = this.this.caracteristicasIndex[trait];
    this.arr[i] &= ~(1 << accepted);
    return this;
};

RestrictionSet.prototype.clear = function (trait) {
    let i = this.caracteristicasIndex[trait];
    this.arr[i] = 0;
    return this;
};

RestrictionSet.prototype.has = function (trait, accepted) {
    let i = this.caracteristicasIndex[trait];
    return (this.arr[i] & (1 << accepted)) !== 0;
};

RestrictionSet.prototype.intersection = function (otherSet) {
    let newSet = new RestrictionSet();

    for (let i = 0; i < this.todasCaracteristicas.length; i++)
        newSet.arr[i] = this.arr[i] & otherSet.arr[i];

    return newSet;
};

RestrictionSet.prototype.union = function (otherSet) {
    let newSet = new RestrictionSet();

    for (let i = 0; i < this.todasCaracteristicas.length; i++)
        newSet.arr[i] = this.arr[i] | otherSet.arr[i];

    return newSet;
};

RestrictionSet.prototype.difference = function (otherSet) {
    let newSet = new RestrictionSet();

    for (let i = 0; i < this.todasCaracteristicas.length; i++)
        newSet.arr[i] = this.arr[i] & ~(this.arr[i] & otherSet.arr[i]);

    return newSet;
};

RestrictionSet.prototype.complement = function () {
    let newSet = new RestrictionSet();

    for (let i = 0; i < this.todasCaracteristicas.length; i++)
        // toggle bits. can't use ~ here because it inverts all bits, giving a negative number
        newSet.arr[i] = 0x3 ^ this.arr[i];

    return newSet;
};

RestrictionSet.prototype.toRestrictionArray = function () {
    let arr = [];
    for (let i = 0; i < this.todasCaracteristicas.length; i++) {
        if (this.arr[i] & (1 << REJECTED))
            arr.push([this.todasCaracteristicas[i], REJECTED]);
        if (this.arr[i] & (1 << ACCEPTED))
            arr.push([this.todasCaracteristicas[i], ACCEPTED]);
    }
    return arr;
};

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

function gerarRestricoes() {
    let acceptedRestrictionsLeft = new TraitContainer();
    let rejectedRestrictionsLeft = new TraitContainer();
    let acceptedRestrictionsRight = new TraitContainer();
    let rejectedRestrictionsRight = new TraitContainer();

    // distribuir as restrições entre as caixas

    // TODO: make this more controllable
    let smallerBoxRatio = -Math.abs(0.5 - randomNormalDistr()) + 0.5; // (0, 0.5] with mean 0.5
    let smallerBoxAccepted;
    let smallerBoxRejected;
    let biggerBoxAccepted;
    let biggerBoxRejected;
    let smallerBoxSize = 0;
    let biggerBoxSize = 0;

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
            com ONE_SIDE.WITH_ACCEPTED adicionando uma característica aceita na outra caixa também.
            ONE_SIDE.WITH_ACCEPTED é feita primeiro pois facilita correção de distribuições "ruins".
        2. Inserir características rejeitadas BOTH_SIDES:
            Distribui rejQty características rejeitadas entre as duas caixas, garantindo que ambas caixas tenham
            pelo menos uma característica rejeitada (se não seria ONE_SIDE.NO_ACCEPTED).
        3. Inserir características aceitas:
            Insere uma característica aceita em uma caixa.

    Esse algoritmo tenta distribuir as restrições de forma mais próxima possível da proporção (boxesRatio).
    A ordem de inserção foi escolhida para que as regras mais rígidas sejam aplicadas primeiro, pois elas perturbam
    mais a proporção, com as regras mais flexíveis depois, corrigindo essa pertubação.

    Para prevenir distribuições "ruins" (como todas restrições em uma caixa só), nós forçamos um "distribuidor" a
    inserir em uma caixa específica (O código que trata a distribuição de restrições ONE_SIDE.WITH_ACCEPTED é um
    distribuidor, por exemplo). O distribuidor que vai ser forçado a inserir em uma caixa é o último que vai ser
    usado pelo nível atual (se um nível não tiver características aceitas, mas tem BOTH_SIDES, este vai ser o último
    distribuidor). As variáveis que forçam seguem o formato <distribuidor>ToFix

    As duas formas de prevenir distribuições "ruins" são:
        1. bothNonEmptyFix: forçar que pelo menos uma caixa tenha pelo menos uma restrição
        2. oswaFix: forçar que uma caixa que tem uma restrição ONE_SIDE.WITH_ACCEPTED tenha outra restrição de uma
            classe diferente (previne que a caixa fique vazia, com as formas só na interseção)
    Restrições BOTH_SIDES, se presentes, previnem essas distribuições "ruins" automaticamente.

    Os nomes encurtados dos distribuidores são:
        - oswa: ONE_SIDE.WITH_ACCEPTED
        - osna: ONE_SIDE.NO_ACCEPTED
        - bs: BOTH_SIDES
        - acc: ACCEPTED

    Como ONE_SIDE.WITH_ACCEPTED possui oswaFix, ele é o primeiro distribuidor a rodar.
    */

    // decidir quem vai corrigir distribuições "ruins"
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
        let chosenTraits = pickRandom([...rejClass], rejQty + 1);
        let acceptedTrait = chosenTraits.pop();

        //                só corrige se já houve uma inserção
        if (oswaToFix && (oswaRejOnSmallerBox || oswaRejOnBiggerBox) ) {
            if (oswaRejOnSmallerBox) {
                smallerBoxRejected.insert(rejClass, ...chosenTraits);
                biggerBoxAccepted.insert(rejClass, acceptedTrait);  // adicionar a restrição aceita na outra caixa
                smallerBoxSize += rejQty;
                biggerBoxSize += 1;
            } else {
                biggerBoxRejected.insert(rejClass, ...chosenTraits);
                smallerBoxAccepted.insert(rejClass, acceptedTrait);  // adicionar a restrição aceita na outra caixa
                biggerBoxSize += rejQty;
                smallerBoxSize += 1;
            }
            oswaToFix = false;  // corrigido
        }

        // +1 porque estamos adicionando a restrição aceita na outra caixa
        let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + 1 + rejQty);
        let ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1 + rejQty);

        // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
        if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
            smallerBoxRejected.insert(rejClass, ...chosenTraits);
            biggerBoxAccepted.insert(rejClass, acceptedTrait);  // adicionar a restrição aceita na outra caixa
            smallerBoxSize += rejQty;
            biggerBoxSize += 1;
            oswaRejOnSmallerBox = true;
        } else {
            biggerBoxRejected.insert(rejClass, ...chosenTraits);
            smallerBoxAccepted.insert(rejClass, acceptedTrait);  // adicionar a restrição aceita na outra caixa
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
            let chosenTraits = pickRandom([...rejClass], rejQty);

            // se tem rejeição oswa, as caixas sempre terão tamanho > 0. boxNonZeroFix e oswaFix são mutuamente exclusivos
            let insertOnSmaller = smallerBoxSize === 0 || oswaRejOnSmallerBox;
            if (insertOnSmaller) {
                smallerBoxRejected.insert(rejClass, ...chosenTraits);
                smallerBoxSize += rejQty;
            } else {
                biggerBoxRejected.insert(rejClass, ...chosenTraits);
                biggerBoxSize += rejQty;
            }
        }
    }
    for (const [rejClass, rejQty] of currentStage.rejectedClasses[ONE_SIDE.NO_ACCEPTED]) {
        let chosenTraits = pickRandom([...rejClass], rejQty);
        let ratioIfInsertOnSmaller = (smallerBoxSize + rejQty) / (smallerBoxSize + biggerBoxSize + rejQty),
            ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + rejQty);

        // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
        if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
            smallerBoxRejected.insert(rejClass, ...chosenTraits);
            smallerBoxSize += rejQty;
        } else {
            biggerBoxRejected.insert(rejClass, ...chosenTraits);
            biggerBoxSize += rejQty;
        }
    }

    //if (bsToFix) {
    //* não é necessário, pois BOTH_SIDES corrige tudo automaticamente
    //}
    for (const [rejClass, rejQty] of currentStage.rejectedClasses[BOTH_SIDES]) {
        let chosenTraits = pickRandom([...rejClass], rejQty);
        // primeiro insere uma restrição rejeitada em cada caixa
        let smallerTrait = chosenTraits.pop(),
            biggerTrait = chosenTraits.pop();
        smallerBoxRejected.insert(rejClass, smallerTrait);
        biggerBoxRejected.insert(rejClass, biggerTrait);
        smallerBoxSize += 1;
        biggerBoxSize += 1;

        // TODO: calculate how many restrictions can be inserted on each box instead of deciding where to insert for each restriction
        for (const trait of chosenTraits) {
            // inserir cada característica uma de cada vez para tentar chegar mais perto de boxesRatio
            let ratioIfInsertOnSmaller = (smallerBoxSize + 1) / (smallerBoxSize + biggerBoxSize + 1),
                ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1);
            // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
            if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
                smallerBoxRejected.insert(rejClass, trait);
                smallerBoxSize += 1;
            } else {
                biggerBoxRejected.insert(rejClass, trait);
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
            let chosenTrait = [...accClass][Math.floor(Math.random() * accClass.length)];

            // se tem rejeição oswa, as caixas sempre terão tamanho > 0. boxNonZeroFix e oswaFix são mutuamente exclusivos
            let insertOnSmaller = smallerBoxSize === 0 || oswaRejOnSmallerBox;
            if (insertOnSmaller) {
                smallerBoxAccepted.insert(accClass, chosenTrait);
                smallerBoxSize += 1;
            } else {
                biggerBoxAccepted.insert(accClass, chosenTrait);
                biggerBoxSize += 1;
            }
        }
    }
    // TODO: calculate how many restrictions can be inserted on each box instead of deciding where to insert for each restriction
    for (const accClass of currentStage.acceptedClasses) {
        let chosenTrait = [...accClass][Math.floor(Math.random() * accClass.length)];
        let ratioIfInsertOnSmaller = (smallerBoxSize + 1) / (smallerBoxSize + biggerBoxSize + 1),
            ratioIfInsertOnBigger = (smallerBoxSize) / (smallerBoxSize + biggerBoxSize + 1);

        // se a proporção depois da inserção na caixa menor for mais próxima de boxesRatio, inserir na caixa menor
        if (Math.abs(ratioIfInsertOnSmaller - smallerBoxRatio) < Math.abs(ratioIfInsertOnBigger - smallerBoxRatio)) {
            smallerBoxAccepted.insert(accClass, chosenTrait);
            smallerBoxSize += 1;
        } else {
            biggerBoxAccepted.insert(accClass, chosenTrait);
            biggerBoxSize += 1;
        }
    }

    if (smallerBoxSize === 0 || biggerBoxSize === 0)
        throw new Error('Deve haver pelo menos duas classes de restrição especificadas quando não há rejeição BOTH_SIDES e é um nível com interseção');

    return [acceptedRestrictionsLeft, rejectedRestrictionsLeft, acceptedRestrictionsRight, rejectedRestrictionsRight];
}

function gerarSets(acceptedRestrictionsLeft, rejectedRestrictionsLeft, acceptedRestrictionsRight, rejectedRestrictionsRight) {
    // <lado>Sets: array de conjuntos que formam todas as formas possíveis na caixa desse lado
    let leftSets = [];
    let middleSets = []; // interseção
    let rightSets = [];

    // gerar os subconjuntos que existem em cada lado

    // conjunto com todas as características
    let universalSet = new TraitSetContainer();
    [...TRAIT].forEach(classe => universalSet.add(classe, ...classe));

    // construir o conjunto que define o conjunto
    // rejeições são invertidas, pois rejeitar uma característica significa aceitar o complemento

    let leftSet = universalSet.clone();
    acceptedRestrictionsLeft.arr.forEach((caracteristicas, i) => {
        if (caracteristicas.length !== 0)
            leftSet.set(TRAIT[i], ...caracteristicas);
    });
    rejectedRestrictionsLeft.arr.forEach((caracteristicas, i) => {
        let classe = TRAIT[i];
        let set = new TraitSetContainer().add(classe, ...caracteristicas);
        leftSet = leftSet.intersection(set.invert(classe), classe);
    });

    let rightSet = universalSet.clone();
    acceptedRestrictionsRight.arr.forEach((caracteristicas, i) => {
        if (caracteristicas.length !== 0)
            rightSet.set(TRAIT[i], ...caracteristicas);
    });
    rejectedRestrictionsRight.arr.forEach((caracteristicas, i) => {
        let classe = TRAIT[i];
        let set = new TraitSetContainer().add(classe, ...caracteristicas);
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
        let set = new TraitSetContainer();
        set.arr = JSON.parse(setStr).map(arr => new Set(arr));
        return set;
    });

    rightSets = [...rightSets].map(setStr => {
        let set = new TraitSetContainer();
        set.arr = JSON.parse(setStr).map(arr => new Set(arr));
        return set;
    });

    middleSets = [...middleSets].map(setStr => {
        let set = new TraitSetContainer();
        set.arr = JSON.parse(setStr).map(arr => new Set(arr));
        return set;
    });

    shuffleArray(leftSets);
    shuffleArray(rightSets);
    shuffleArray(middleSets);

    return [leftSets, middleSets, rightSets];
}

function limitarSets(leftSets, middleSets, rightSets) {
    let leftChosenSets = [];
    let middleChosenSets = [];
    let rightChosenSets = [];

    let limitVec = Array(TRAIT.length);
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
            let set = new TraitSetContainer().union(leftSet).union(middleSet).union(rightSet);

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

    leftChosenSets = [minCombination[0]];
    middleChosenSets = [minCombination[1]];
    rightChosenSets = [minCombination[2]];

    // as características que estão sendo usadas no momento
    let currentTraits = minSet;

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
    temos que escolher o maior número possível deles, de forma que currentTraits seja menor ou igual a limitVec.

    Todo conjunto tem um peso, que é 1 para cada classe (as dimensões). Como um conjunto e currentTraits (o
    conjunto de características que estão sendo usadas no momento) podem possuir uma interseção, o "peso real" pode
    não ser [1, 1, 1, 1]. Esse "peso real" é quanto o conjuntos adiciona ao currentTraits.
    Se currentTraits já tem TRAIT.SHAPE.SQUARE, um conjunto que também tem vai ter peso real zero
    nessa classe/dimensão. Como adicionar um conjunto à solução altera currentTraits, o peso real dos
    conjuntos restantes podem mudar, por isso esse problema é dinâmico.

    A capacidade da mochila é limitVec, que é um vetor com a quantidade máxima de características de cada classe que
    podem ser usadas. Um limitVec igual a [2, 3, 1, 2] significa que podemos ter no máximo 2 cores, 3 formas, 1
    tamanho e 2 contornos.

    Mesmo que o artigo use recompensa/lucro, aqui ele não é usado, sendo 1 para todos os conjuntos. Isso causa o
    algoritmo a escolher conjuntos com a maior capacidade efetiva, ou seja, conjuntos que possam ter o maior número
    máximo de cópias sem ultrapassar o limite (isso é explicado melhor no artigo). Um cálculo de recompensa que
    que melhore a qualidade da solução pode ser implementada no futuro.

    PECH é um algoritmo muito bom e muito rápido. No nosso caso, número pequeno de dimensões (4) e número pequeno
    de items (no máximo 93, bem menos em média), ele provê soluções ótimas ou quasi-ótimas. O único algoritmo que
    seria melhor em precisão, devido ao número de items (ver Tabela 10 do artigo), seria PIR_G (Pirkul & Narasimhan,
    1986), mas esse usa programação linear e é mais complexo de implementar.

    A implementação aqui segue o seguinte algoritmo:
    1. Junta todos os conjuntos em um único array, adicionando com eles um identificador de qual lado eles são.
    2. Itera sobre os conjuntos, calculando a recompensa de cada um, escolhendo o melhor e adicionando ele à solução.
    3. Caso esse melhor conjunto tenha capacidade efetiva de 0, o melhor conjunto não é inserido e o algoritmo
        termina, pois não há como inserir mais conjuntos na solução.
    4. Caso contrário, o conjunto é adicionado à solução e o currentTraits é atualizado.
    5. Caso não tenha mais conjuntos para iterar, o algoritmo termina.
    */
    {
        let allSets = [...leftSets.map(s => [leftChosenSets, s]),
                       ...rightSets.map(s => [rightChosenSets, s]),
                       ...middleSets.map(s => [middleChosenSets, s])];

        while(allSets.length !== 0) {
            let maxSet, maxSetSide;
            let maxSetProfit = 0;
            let currentLimit = limitVec.map((l, i) => l - currentTraits.arr[i].size);
            for (const [side, set] of allSets) {
                let setWeightVec = set.difference(currentTraits).arr.map(s => s.size);

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
            currentTraits = currentTraits.union(maxSet);
            // remove o conjunto escolhido do array
            allSets.splice(allSets.findIndex(([_, s]) => s === maxSet), 1);
        }
    }

    return [leftChosenSets, middleChosenSets, rightChosenSets];
}

/**
 * Gera as formas para uma caixa, gerando uma forma para cada conjunto em restrictionSets
 * @param {RestrictionSetContainer[]} restrictionSets Array de conjuntos simples (uma característica por classe)
 * @returns {Map<Object, Number>[]} Array contendo as peças geradas para essa caixa (formato Map([[CLASSE_CARACTERISTICA, CARACTERISTICA], ...]))
 */
function gerarFormas(restrictionSets) {
    let caixaItems = [];

    for (const set of restrictionSets) {
        let piece = new Map();
        for (const classe of [...TRAIT])
            piece.set(classe, [...set.get(classe)][0]);
        caixaItems.push(piece);
    }

    return caixaItems;
}

function gerarNivel(newCurrentStage, newIntersecaoAtiva) {
    currentStage = newCurrentStage;
    intersecaoAtiva = newIntersecaoAtiva;

    let acceptedRestrictionsLeft;
    let rejectedRestrictionsLeft;
    let acceptedRestrictionsRight;
    let rejectedRestrictionsRight;

    let leftChosenSets;
    let middleChosenSets;
    let rightChosenSets;

    if (!newIntersecaoAtiva) {
        acceptedRestrictionsLeft = new TraitContainer();
        rejectedRestrictionsLeft = new TraitContainer();
        acceptedRestrictionsRight = new TraitContainer();
        rejectedRestrictionsRight = new TraitContainer();

        // níveis iniciais, eles devem ter somente uma classe de restrição que deve sempre ser aceita
        if (currentStage.acceptedClasses.length === 0)
            throw new Error('Nenhuma classe aceita num nível inicial!');

        let classe = currentStage.acceptedClasses[0];
        let caracteristicasDisponiveis = [...classe];
        let [left, right] = pickRandom(caracteristicasDisponiveis, 2);
        acceptedRestrictionsLeft.insert(classe, left);
        acceptedRestrictionsRight.insert(classe, right);

        let leftSet = new TraitSetContainer().add(classe, left),
            rightSet = new TraitSetContainer().add(classe, right);

        // random control
        currentStage.randomLimits.delete(classe); // efeito permanente sem problema, pois nem deveria existir
        for (const [classe, qty] of currentStage.randomLimits.entries()) {
            let chosenTraits = pickRandom([...classe], qty);
            leftSet.add(classe, ...chosenTraits);
            rightSet.add(classe, ...chosenTraits);
        }

        leftChosenSets = leftSet.toSingleSubsets();
        rightChosenSets = rightSet.toSingleSubsets();
        middleChosenSets = [];
    } else {
        // definir as restrições para cada caixa
        [acceptedRestrictionsLeft,
         rejectedRestrictionsLeft,
         acceptedRestrictionsRight,
         rejectedRestrictionsRight] = gerarRestricoes(currentStage, intersecaoAtiva);

        let [leftSets,
             middleSets,
             rightSets] = gerarSets(acceptedRestrictionsLeft, rejectedRestrictionsLeft, acceptedRestrictionsRight, rejectedRestrictionsRight);

        [leftChosenSets,
         middleChosenSets,
         rightChosenSets] = limitarSets(leftSets, middleSets, rightSets);
    }

    // gerar as formas em cada caixa
    let caixaEsquerdaItems = gerarFormas(leftChosenSets);
    let caixaIntersecaoItems = gerarFormas(middleChosenSets);
    let caixaDireitaItems = gerarFormas(rightChosenSets);

    // limitar a quantidade de formas mantendo a quantidade mais ou menos bem dividida entre as caixas
    // TODO: make this more controllable
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

    return [acceptedRestrictionsLeft, rejectedRestrictionsLeft, acceptedRestrictionsRight, rejectedRestrictionsRight, caixaEsquerdaItems, caixaIntersecaoItems, caixaDireitaItems];
}

export { gerarNivel, shuffleArray, RestrictionSet };
