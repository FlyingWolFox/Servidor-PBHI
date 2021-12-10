var etapaAtual = 0;   //Etapa do exercício
var estrela = 0;      //Contagem das estrelas (5 por etapa)
var endGame;
var restricao1 = [];   //Restriçoes da primeira caixa (esquerda)
var restricao2 = [];   //Restriçoes da terceira caixa (direita)
var estadoRestricao1 = [] //Imagem como proibida (Negado) / Imagem é para ser colocada (Aceito) - ESQUERDA
var estadoRestricao2 = [] //Imagem como proibida (Negado) / Imagem é para ser colocada (Aceito) - DIREITA
var imgMov1 = [];      //Confere se falta colocar alguma imagem da primeira caixa 
var imgMov2 = [];      //Confere se falta colocar alguma imagem da terceira caixa 
let quantidade = 0;
var primeiraRodada = true;

const textNumeroFase = 'textbox-numero-fase';
const divFormas = 'container-formas';
const dropPrimeiro = 'drop1';
const dropSegundo = 'intDrop';
const dropTerceiro = 'drop2';
const diagrama = 'diagrama';
const divRestricao1 = 'conteiner-restricao-esquerda';
const divRestricao2 = 'conteiner-restricao-direita';
const forma = 0, cor = 1, tamanho = 2, contorno = 3;
const divEstrelas = 'container-estrelas';
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');

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

function removeChildElementsByTag(parent, tag) {
    if(parent != null){
        var parentDom = document.getElementById(parent);
        var elements = parentDom.getElementsByTagName(tag);
        var i;
        for (i = elements.length - 1; i >= 0; i--) {
            //parentDom.removeChild(elements[i]);
            elements[i].remove();
        }
    }
}

function reset() {
    removeChildElementsByTag(divFormas, 'img');
    removeChildElementsByTag(divRestricao1, 'img');
    removeChildElementsByTag(divRestricao2, 'img');
    removeChildElementsByTag(dropPrimeiro, 'img');
    removeChildElementsByTag(dropSegundo, 'img');
    removeChildElementsByTag(dropTerceiro, 'img');

     //Array contendo todos os elementos gerados
    restricao1 = [];
    restricao2 = [];
}

function resetEstrelas() {
    estrela = 0;
    for (var i = 0; i < arrayEstrelas.length; i++) {
        arrayEstrelas[i].setAttribute('src', './img/estrelas/star2.svg');
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

function getImgAlt(img){
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

function getImgScr(forma, cor, tamanho, contorno) {   //Cria a src a partir dos valores dos atributos
    var src = './img/';

    switch (parseInt(forma)) {
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

    switch (parseInt(cor)) {
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

    switch (parseInt(tamanho)) {
        case tamanhoEnum.grande:
            src += 'G';
            break;
        case tamanhoEnum.pequeno:
            src += 'P';
            break;
    }

    switch (parseInt(contorno)) {
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

function repetida(imgGerada, arrayImg) {
    let flag =0;
    let aux;

    arrayImg.forEach(el => {
        if(el.getAttribute('data-tipo') == imgGerada.getAttribute('data-tipo')){
            flag++;
        }
        if(el.getAttribute('data-cor') == imgGerada.getAttribute('data-cor')){
            flag++;
        }
        if(el.getAttribute('data-tam') == imgGerada.getAttribute('data-tam')){
            flag++;
        }
        if(el.getAttribute('data-cont') == imgGerada.getAttribute('data-cont')){
            flag++;
        }
        
        if(flag == 4){
            aux = 1;
        }
        flag = 0;
    });

    if(aux == 1){
        return 1;
    }
    else{
        return 0;
    }
}

function getRestrictScr(estado, classificação, valor) {   //Cria a src a partir dos valores dos atributos
    var src = '';
    var srcAlt = '';
    var alt = '';
    var novaImg = document.createElement("img");

    if(estado == 'Negado'){
        srcAlt += 'Não podem peças que ';
    }
    else{  
        srcAlt += 'Podem peças que ';
    }

    switch (classificação) {

        case forma:
            switch(valor){
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

    if(estado == 'Negado'){                         
        alt += '-nao';
    }
    else{
        alt += '-sim';
    }

    src += './img/restricoes/' + alt + '.svg';
    novaImg.setAttribute('src', src);
    novaImg.setAttribute('alt', srcAlt);
    novaImg.setAttribute('title', srcAlt);


    return novaImg;
}

function imgRestricao(quantCor, quantTipo, quantTam, quantCont){
	
	var novaImg = document.createElement("img");
	var arq, tipo, tam, cor, cont;

	/*Adiciona as características priorizando as restrições*/
	if(restricao1[forma] != null){	
        if(estadoRestricao1[forma] == 'Aceito'){
            novaImg.setAttribute('data-tipo', restricao1[forma]);
		    tipo = restricao1[forma];
        }
        else{
            do{
                tipo = getRandomIntInclusive(0,3);
            }while(tipo == restricao1[forma] && tipo == restricao2[forma]);
            novaImg.setAttribute('data-tipo', tipo);
        }
		
	}else{
		if(restricao2[forma] != null && quantTipo == 1){	
			if(estadoRestricao2[forma] == 'Aceito'){
                novaImg.setAttribute('data-tipo', restricao2[forma]);
                tipo = restricao2[forma];
            }
            else{
                do{
                    tipo = getRandomIntInclusive(0,3);
                }while(tipo == restricao2[forma]);
                novaImg.setAttribute('data-tipo', tipo);
            }

		}else{
			do{
                tipo = getRandomIntInclusive(0,3);
            }while(restricao2[forma] != null && tipo == restricao2[forma]);
            novaImg.setAttribute('data-tipo', tipo);
		}

	}

	if(restricao1[1] != null){	
		if(estadoRestricao1[1] == 'Aceito'){
            novaImg.setAttribute('data-cor', restricao1[1]);
		    cor = restricao1[1];
        }
        else{
            do{
                cor = getRandomIntInclusive(0,2);
            }while(cor == restricao1[1]);
            novaImg.setAttribute('data-cor', cor);
        }

	}else{
		if(restricao2[1] != null && quantCor == 1){	 
			if(estadoRestricao2[1] == 'Aceito'){
                novaImg.setAttribute('data-cor', restricao2[1]);
                cor = restricao2[1];
            }
            else{
                do{
                    cor = getRandomIntInclusive(0,2);
                }while(cor == restricao2[1]);
                novaImg.setAttribute('data-cor', cor);
            }

		}else{
			do{
                cor = getRandomIntInclusive(0,2);
            }while(restricao2[1] != null && cor == restricao2[1]);
            novaImg.setAttribute('data-cor', cor);
		}
	}

	if(restricao1[tamanho] != null){	
		if(estadoRestricao1[tamanho] == 'Aceito'){
            novaImg.setAttribute('data-tam', restricao1[tamanho]);
		    tam = restricao1[tamanho];
        }
        else{
            do{
                tam = getRandomIntInclusive(0,1);
            }while(tam == restricao1[tamanho]);
            novaImg.setAttribute('data-tam', tam);
        }

	}else{
		if(restricao2[tamanho] != null && quantTam == 1){	
			if(estadoRestricao2[tamanho] == 'Aceito'){
                novaImg.setAttribute('data-tam', restricao2[tamanho]);
                tam = restricao2[tamanho];
            }
            else{
                do{
                    tam = getRandomIntInclusive(0,1);
                }while(tam == restricao2[tamanho]);
                novaImg.setAttribute('data-tam', tam);
            }

		}else{
			do{
                tam = getRandomIntInclusive(0,1);
            }while(restricao2[tamanho] != null && tam == restricao2[tamanho]);
            novaImg.setAttribute('data-tam', tam);
		}

	}

	if(restricao1[contorno] != null){	
		if(estadoRestricao1[contorno] == 'Aceito'){
            novaImg.setAttribute('data-cont', restricao1[contorno]);
		    cont = restricao1[contorno];
        }
        else{
            do{
                cont = getRandomIntInclusive(0,1);
            }while(cont == restricao1[contorno]);
            novaImg.setAttribute('data-cont', cont);
        }

	}else{
		if(restricao2[contorno] != null && quantCont == 1){	
            if(estadoRestricao2[contorno] == 'Aceito'){
                novaImg.setAttribute('data-cont', restricao2[contorno]);
                cont = restricao2[contorno];
            }
            else{
                do{
                    cont = getRandomIntInclusive(0,1);
                }while(cont == restricao2[contorno]);
                novaImg.setAttribute('data-cont', cont);
            }

		}else{
			do{
                cont = getRandomIntInclusive(0,1);
            }while(restricao2[contorno] != null && cont == restricao2[contorno]);
            novaImg.setAttribute('data-cont', cont);
		}

	}

	arq = getImgScr(tipo, cor, tam, cont);
	novaImg.setAttribute('src', arq);
	novaImg.classList.add('drag');
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
        }

        //escolher cor
        for (i = 0; i < corUsada.length; i++) {
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
        while (1) {
            tam = getRandomIntInclusive(0, 1);
            if (tamanhosUsados < maxTamanhos && !tamanhoUsado[tam]) {
                break;
            }
            if (tamanhosUsados >= maxTamanhos && tamanhoUsado[tam]) {
                break;
            }
        }
        //escolher contorno
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
        cor = getRandomIntInclusive(0, 2);
        tipo = getRandomIntInclusive(0, 3);
        tam = getRandomIntInclusive(0, 1);
        cont = getRandomIntInclusive(0, 1);
    }

    if(parametro == 2 && quantidade != 0){

        if(restricao2[0] != null){
            tipo = restricao2[0];
        }
        else{
            while(restricao1[0] != null && tipo == restricao1[0]){
                tipo = getRandomIntInclusive(0, 3);
            }
        }

        if(restricao2[1] != null){	
            cor = restricao2[1];
        }
        else{
            while(restricao1[1] != null && cor == restricao1[1]){
                cor = getRandomIntInclusive(0, 2);
            }
        }

        if(restricao2[2] != null){	
            tam = restricao2[2];
        }
        else{
            while(restricao1[2] != null && tam == restricao1[2]){
                tam = getRandomIntInclusive(0, 1);
            }
        }

        if(restricao2[3] != null){	
            cont = restricao2[3];
        }
        else{
            while(restricao1[3] != null && cont == restricao1[3]){
                cont = getRandomIntInclusive(0, 1);
            }
        }

    }

    if(parametro == 3 && quantidade == 3){
        if(restricao2[0] != null){
            tipo = restricao2[0];
        }
        else{
            if(restricao1[0] != null){
                tipo = restricao1[0];
            }
        }

        if(restricao2[1] != null){	
            cor = restricao2[1];
        }
        else{
            if(restricao1[1] != null){	
                cor = restricao1[1];
            }
        }

        if(restricao2[2] != null){	
            tam = restricao2[2];
        }
        else{
            if(restricao1[2] != null){	
                tam = restricao1[2];
            }
        }

        if(restricao2[3] != null){	
            cont = restricao2[3];
        }
        else{
            if(restricao1[3] != null){	
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

    return novaImg;
}

function conferir(numero, completo){   //Confere se o número já foi utilizado 

    var flagTest = 0;
 
    completo.forEach(el=>{
        if(el == numero){
            flagTest = 1;
        }
    });
 
    return flagTest;
 
 }

function pegarNome(objects){ //recebe o valor das caracteristicas da imagem e transforma em uma string respectiva
    var imgsNome = [];
    for(i = 0; i < objects.length; i++){
        var imgNome = []
        switch (parseInt(objects[i]["forma"])){
            case 0: imgNome[0] = "T";break;
            case 1: imgNome[0] = "Q";break;
            case 2: imgNome[0] = "R";break;
            case 3: imgNome[0] = "C";break;
        }
        switch (parseInt(objects[i]["cor"])){
            case 0: imgNome[1] = "Z";break;
            case 1: imgNome[1] = "V";break;
            case 2: imgNome[1] = "A";break;
        }
        switch (parseInt(objects[i]["tamanho"])){
            case 0: imgNome[2] = "G";break;
            case 1: imgNome[2] = "P";break;
        }
        switch (parseInt(objects[i]["contorno"])){
            case 0: imgNome[3] = "C";break;
            case 1: imgNome[3] = "S";break;
        }
        imgsNome.push(imgNome)
    }
    return imgsNome

}

function pegarFilhos(){ //Pega as imagens, analisa suas caracteristicas e as retorna
    var divForms = document.getElementById(divFormas).childNodes;
    var newDivForms = [];

    for(i = 3; i < divForms.length; i++){
        var divAtt = {};  
        divAtt["forma"] = divForms[i].getAttribute('data-tipo')
        divAtt["cor"] = divForms[i].getAttribute('data-cor')
        divAtt["tamanho"] = divForms[i].getAttribute('data-tam')
        divAtt["contorno"] = divForms[i].getAttribute('data-cont')
        newDivForms.push(divAtt)
    }
    return newDivForms
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
    var textNumeroFaseDom = document.getElementById(textNumeroFase);
	textNumeroFaseDom.innerHTML = (etapaAtual + 1);

    /*Padronizado os valores das variaveis de controle de acordo com a etapa sendo:
    0-9: Duas caixas | 10-19: Três caixas (Com respostas nas opções) | 20-29: Mais de uma restrição 
    30-37: Restrições "Negado" e "Aceito" | 38-39: Três caixas (Sem respostas nas opções)*/
    switch (etapaAtual) {
        case 0:
            try {
                removeDiagram() 
            } catch (error) {
                
            }
            tamOpcoes = 4;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            if(primeiraRodada == true){
                createDiagram([restricao1[forma]],[restricao2[forma]],[0],[0],false)
            }
            else{
                startDiagrama([restricao1[forma]],[restricao2[forma]],[0],[0],false)
            }
           break;
        case 1:
            removeDiagram()
           tamOpcoes = 4;
           restricao1[forma] = formasEnum.circulo;
           restricao2[forma] = formasEnum.retangulo;
           estadoRestricao1[forma] = 'Aceito';
           estadoRestricao2[forma] = 'Aceito';
           coresDistintas = 1;
           formasDistintas = 4;
           tamanhosDistintos = 1;
           contornosDistintos = 1;
           startDiagrama([restricao1[forma]],[restricao2[forma]],[0],[0],false)
           break;
        case 2:
            removeDiagram()
            tamOpcoes = 5;
            restricao1[forma] = formasEnum.circulo;
            restricao2[forma] = formasEnum.triangulo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[forma]],[restricao2[forma]],[0],[0],false)
            break;
        case 3:
            removeDiagram()
            tamOpcoes = 5;
            restricao1[forma] = formasEnum.retangulo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[forma]],[restricao2[forma]],[0],[0],false)
            break;
        case 4:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[forma]],[restricao2[forma]],[0],[0],false)
            break;
        case 5:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            startDiagrama([restricao1[forma]],[restricao2[forma]],[0],[0],false)
            break;
        case 6:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.azul;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[cor]],[1],[1],false)
            break;
        case 7:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.amarelo;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[cor]],[1],[1],false)
            break;
        case 8:
            removeDiagram()
            tamOpcoes = 5;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[cor]],[1],[1],false)
            break;
        case 9:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[tamanho] = tamanhoEnum.pequeno;
            restricao2[tamanho] = tamanhoEnum.grande;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            startDiagrama([restricao1[tamanho]],[restricao2[tamanho]],[2],[2],false)
            break;
        case 10:        //Inicia intersecção (com resposta)
            removeDiagram()
            tamOpcoes = 4;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true)
            break;
        case 11:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.amarelo;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true)
            break;
        case 12:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.circulo;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 2;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[forma]],[restricao2[cor]],[0],[1],true)
            break;
        case 13:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[forma] = formasEnum.triangulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true)
            break;
        case 14:
            removeDiagram()
            tamOpcoes = 5;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.retangulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true)
            break;
        case 15:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.circulo;
            restricao2[cor] = coresEnum.amarelo;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            startDiagrama([restricao1[forma]],[restricao2[cor]],[0],[1],true)
            break;
        case 16:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.triangulo;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            startDiagrama([restricao1[forma]],[restricao2[tamanho]],[0],[2],true)
            break;
        case 17:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[tamanho] = tamanhoEnum.grande;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            startDiagrama([restricao1[tamanho]],[restricao2[forma]],[2],[0],true)
            break;
        case 18:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[contorno] = contornoEnum.comContorno;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[contorno] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            startDiagrama([restricao1[contorno]],[restricao2[cor]],[3],[1],true)
            break;
        case 19:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[cor] = coresEnum.azul;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[tamanho]],[1],[2],true)
            break;
        case 20:        //Mais de uma restrição
            removeDiagram()
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
            startDiagrama([restricao1[forma],restricao1[cor]],[restricao2[contorno]],[0,1],[3],true)
            break;
        case 21:
            removeDiagram()
            tamOpcoes = 8;
            restricao1[cor] = coresEnum.azul;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[forma] = formasEnum.quadrado;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true)

            break;
        case 22:
            removeDiagram()
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
            startDiagrama([restricao1[forma]],[restricao2[contorno]],[0],[3],true)

            break;
        case 23:
            removeDiagram()
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
            startDiagrama([restricao1[forma]],[restricao2[cor]],[0],[3],true)
            break;
        case 24:
            removeDiagram()
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
            startDiagrama([restricao1[contorno],restricao1[forma]],[restricao2[cor]],[3,0],[1],true)
            break;
        case 25:
            removeDiagram()
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
            startDiagrama([restricao1[forma]],[restricao2[cor],restricao2[tamanho]],[0],[1,2],true)
            break;
        case 26:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[forma] = formasEnum.retangulo;
            restricao2[tamanho] = tamanhoEnum.grande;
            restricao2[contorno] = contornoEnum.semContorno;
            estadoRestricao1[forma] = 'Aceito';
            estadoRestricao2[tamanho] = 'Aceito';
            estadoRestricao2[contorno] = 'Aceito';
            coresDistintas = 1;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            startDiagrama([restricao1[forma]],[restricao2[tamanho],restricao2[contorno]],[0],[2,3],true);
            break;
        case 27:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[tamanho] = tamanhoEnum.grande;
            restricao2[contorno] = contornoEnum.semContorno;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[tamanho] = 'Aceito';
            estadoRestricao2[contorno] = 'Aceito';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 1;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            startDiagrama([restricao1[tamanho]],[restricao2[contorno],restricao2[cor]],[2],[3,1],true);

            break;
        case 28:
            removeDiagram()
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
            startDiagrama([restricao1[tamanho],restricao1[cor]],[restricao2[forma]],[2,1],[0],true);

            break;
        case 29:
            removeDiagram()
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
            startDiagrama([restricao1[forma],restricao1[cor]],[restricao2[tamanho],restricao2[contorno]],[0,1],[2,3],true);
            break;
        case 30:        //Restrição proibida
            removeDiagram()
            tamOpcoes = 7;
            restricao1[cor] = coresEnum.azul;
            restricao2[forma] = formasEnum.triangulo;
            estadoRestricao1[cor] = 'Negado';
            estadoRestricao2[forma] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true);
            break;
        case 31:
            removeDiagram()
            tamOpcoes = 6;
            restricao1[cor] = coresEnum.azul;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[cor] = 'Negado';
            estadoRestricao2[cor] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 1;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[cor]],[1],[1],true);
            break;
        case 32:
            removeDiagram();
            tamOpcoes = 6;
            restricao1[forma] = formasEnum.circulo;
            restricao2[tamanho] = tamanhoEnum.grande;
            estadoRestricao1[forma] = 'Negado';
            estadoRestricao2[tamanho] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            startDiagrama([restricao1[forma]],[restricao2[tamanho]],[0],[2],true);
            break;
        case 33:
            removeDiagram()
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
            startDiagrama([restricao1[forma]],[restricao2[contorno]],[0],[3],true);
            break;
        case 34:
            removeDiagram()
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
            startDiagrama([restricao1[contorno],restricao1[forma]],[restricao2[cor]],[3,0],[1],true);
            break;
        case 35:
            removeDiagram()
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
            startDiagrama([restricao1[forma]],[restricao2[tamanho],restricao2[cor]],[0],[2,1],true);

            break;
        case 36:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[contorno] = contornoEnum.semContorno;
            restricao2[cor] = coresEnum.vermelho;
            estadoRestricao1[contorno] = 'Negado';
            estadoRestricao2[cor] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 2;
            tamanhosDistintos = 1;
            contornosDistintos = 2;
            startDiagrama([restricao1[contorno]],[restricao2[cor]],[3],[1],true);
            break;
        case 37:
            removeDiagram()
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
            startDiagrama([restricao1[forma]],[restricao2[tamanho]],[0],[2],true);
            break;
        case 38:        //Sem necessidade de resposta correta nas opções
            removeDiagram()
            tamOpcoes = 8;
            restricao1[cor] = coresEnum.vermelho;
            restricao2[forma] = formasEnum.circulo;
            estadoRestricao1[cor] = 'Aceito';
            estadoRestricao2[forma] = 'Negado';
            coresDistintas = 3;
            formasDistintas = 4;
            tamanhosDistintos = 2;
            contornosDistintos = 1;
            startDiagrama([restricao1[cor]],[restricao2[forma]],[1],[0],true);
            break;
        case 39:
            removeDiagram()
            tamOpcoes = 7;
            restricao1[contorno] = contornoEnum.comContorno;
            restricao2[tamanho] = tamanhoEnum.pequeno;
            estadoRestricao1[contorno] = 'Negado';
            estadoRestricao2[tamanho] = 'Aceito';
            coresDistintas = 3;
            formasDistintas = 3;
            tamanhosDistintos = 2;
            contornosDistintos = 2;
            startDiagrama([restricao1[contorno]],[restricao2[tamanho]],[3],[2],true);
            endGame = true;
            break;
        default:	
           return;
    }
    
    /*Containers*/
    var divForms = document.getElementById(divFormas);
    var divDiagrama = document.getElementById(divDiagrama);
    var divEsquerda =  document.getElementById(divRestricao1);
    var divDireita =  document.getElementById(divRestricao2);
    
    /*verificar quantas imagens eu preciso criar*/
    /*verificar quantas imagens eu preciso criar*/
    var arrayReferencia = [];
    var arrayIndices = [];
    var arrayDeOpcoes = [];
    var arrayOpcoesFinal = [];
    var novaImagem;
    let numero = 0;
    quantidade = 0;

    if(etapaAtual < 10){ //Inicial - Sem intersecção - 2 respostas prontas 
       quantidade = 2;
    }
    if(etapaAtual > 11 && etapaAtual < 38){ //Intermediário - Com intersecção - 3 respostas prontas 
       quantidade = 3;
    }

    /* Primeira imagem correta*/
    for (i = 0; i < (tamOpcoes-1); i++){
        arrayReferencia.push('');
    }

    novaImagem = imgRestricao(coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
    arrayDeOpcoes.push(novaImagem);

    //Criar a quantidade de imagens especificadas e fazer o push para o array

	i=2;
    arrayReferencia.forEach(el => {
        
        do{
            novaImagem = novaImgBlocoLogicoComRestricoes(arrayDeOpcoes, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos, i, quantidade);
        }while(repetida(novaImagem, arrayDeOpcoes));
        arrayDeOpcoes.push(novaImagem);
		i++;

    });

    /* Gera as imagens das restrições */
    for (i = 0; i < 4; i++){
        arrayReferencia.push('');
    }
    i=0;

    arrayReferencia.forEach(el =>{  //Caixa da esquerda

        if(restricao1[i] == null){
            i++;
            return;
        }
        else{
            novaImagem = getRestrictScr(estadoRestricao1[i], i, restricao1[i]);
            novaImagem.setAttribute('class', 'img-restricao-esquerda');
            divEsquerda.appendChild(novaImagem);
        }
        
        i++;
        
    });

    i=0;
    arrayReferencia.forEach(el =>{  //Caixa da direita

        if(restricao2[i] == null){
            i++;
            return;
        }
        else{
            novaImagem = getRestrictScr(estadoRestricao2[i], i, restricao2[i]);
            novaImagem.setAttribute('class', 'img-restricao-direita'); 
            divDireita.appendChild(novaImagem);
        }
        
        i++;
        
    });

	/*Modifica a ordem das imagens no array*/
    arrayDeOpcoes.forEach(el =>{

        do{
            numero = getRandomIntInclusive(0, (tamOpcoes-1));
        }while(conferir(numero, arrayIndices));

        arrayOpcoesFinal[numero] = el;
        arrayIndices.push(numero);

    });

    /*Fazendo o append com a divForms*/
    arrayOpcoesFinal.forEach(el => {
        
        divForms.appendChild(el);

    });

    background(quantidade);

}

function background(caixas){

    var dropzoneArea = document.getElementById('dropzone-container');
    var dropEsquerda = document.getElementById(dropPrimeiro);
    var dropMeio = document.getElementById(dropSegundo);
    var dropDireita = document.getElementById(dropTerceiro);
    var dropDiagrama = document.getElementById(diagrama);

    /* Gerar imagens do fundo */
    if(caixas == 2) {
        dropDiagrama.setAttribute('Style', 'grid-column: 1/5; grid-row: 2/3;')
        dropEsquerda.setAttribute('style', 'grid-column: 2/3; grid-row: 1/4;');
        dropDireita.setAttribute('style', 'grid-column: 4/5; grid-row: 1/4;');
        dropMeio.setAttribute('style', 'display: none;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr 5fr 1fr 5fr 2fr;')
        dropEsquerda.classList.remove('drop-meio-ativo');
        dropMeio.classList.remove('drop-meio-ativo');
        dropDireita.classList.remove('drop-meio-ativo');

    } else {

        dropEsquerda.setAttribute('style', 'grid-column: 2/4; grid-row: 1/3;');
        dropDireita.setAttribute('style', 'grid-column: 3/5; grid-row: 2/4;');
        dropMeio.setAttribute('style', 'grid-column: 3/4; grid-row: 2/3;');
        dropzoneArea.setAttribute('style', 'grid-template-columns: 2fr repeat(3, 3fr) 2fr;')
        dropEsquerda.classList.add('drop-meio-ativo');
        dropMeio.classList.add('drop-meio-ativo');
        dropDireita.classList.add('drop-meio-ativo');

    }
}

function first(container, letra){   //Analisa a caixa da esquerda

   /*contador - índice do array, armazenando a quantidade de flags por imagem
   flag - indica se o atributo é diferente do contido na restrição 
   aux - guarda o valor de todas as flags*/
   var contador = 0, flag = 0, aux = 0;

   /*Analisa as imagens do container com relação a primeira restrição*/
   Array.prototype.filter.call(container, el => {
       flag = 0;

    if(estadoRestricao1[forma] != null && estadoRestricao1[forma] == 'Aceito'){
        if(restricao1[0]!=null && el.getAttribute('data-tipo') != restricao1[forma]){
            flag++;
        }
    }
    if(estadoRestricao1[forma] != null && estadoRestricao1[forma] == 'Negado'){
         if(restricao1[0]!=null && el.getAttribute('data-tipo') == restricao1[forma]){
            flag++;
         }
     }

     if(estadoRestricao1[cor] != null && estadoRestricao1[cor] == 'Aceito'){
         if(restricao1[1]!=null && el.getAttribute('data-cor') != restricao1[cor]){
             flag++; 
         }
     }
     if(estadoRestricao1[cor] != null && estadoRestricao1[cor] == 'Negado'){
         if(restricao1[1]!=null && el.getAttribute('data-cor') == restricao1[cor]){
             flag++; 
         }
     }

     if(estadoRestricao1[tamanho] != null && estadoRestricao1[tamanho] == 'Aceito'){
         if(restricao1[2]!=null && el.getAttribute('data-tam') != restricao1[tamanho]){
             flag++;
         }
     }
     if(estadoRestricao1[tamanho] != null && estadoRestricao1[tamanho] == 'Negado'){
         if(restricao1[2]!=null && el.getAttribute('data-tam') == restricao1[tamanho]){
             flag++;
         }
     }


     if(estadoRestricao1[contorno] != null && estadoRestricao1[contorno] == 'Aceito'){
         if(restricao1[3]!=null && el.getAttribute('data-cont') != restricao1[contorno]){
             flag++;
         }
     }
     if(estadoRestricao1[contorno] != null && estadoRestricao1[contorno] == 'Negado'){
         if(restricao1[3]!=null && el.getAttribute('data-cont') == restricao1[contorno]){
             flag++;
         }
     }

       if(letra == 's'){
           imgMov1[contador] = flag;	
       }

       contador++;
       aux = aux + flag;
   })

   return aux;
}

function third(container, letra){   //Analisa a caixa da direita

   /*contador - índice do array, armazenando a quantidade de flags por imagem
   flag - indica se o atributo é diferente do contido na restrição 
   aux - guarda o valor de todas as flags*/
   var contador = 0, flag = 0, aux = 0;

   /*Analisa as imagens do container com relação a segunda restrição*/
   Array.prototype.filter.call(container, el => {
       flag = 0;

       if(estadoRestricao2[forma] != null && estadoRestricao2[forma] == 'Aceito'){
           if(restricao2[forma]!=null && el.getAttribute('data-tipo') != restricao2[forma]){
                flag++;
           }
       }
       if(estadoRestricao2[forma] != null && estadoRestricao2[forma] == 'Negado'){
            if(restricao2[0]!=null && el.getAttribute('data-tipo') == restricao2[forma]){
                flag++;
            }
        }

        if(estadoRestricao2[cor] != null && estadoRestricao2[cor] == 'Aceito'){
            if(restricao2[1]!=null && el.getAttribute('data-cor') != restricao2[cor]){
                flag++; 
            }
        }
        if(estadoRestricao2[cor] != null && estadoRestricao2[cor] == 'Negado'){
            if(restricao2[1]!=null && el.getAttribute('data-cor') == restricao2[cor]){
                flag++; 
            }
        }

        if(estadoRestricao2[tamanho] != null && estadoRestricao2[tamanho] == 'Aceito'){
            if(restricao2[2]!=null && el.getAttribute('data-tam') != restricao2[tamanho]){
                flag++;
            }
        }
        if(estadoRestricao2[tamanho] != null && estadoRestricao2[tamanho] == 'Negado'){
            if(restricao2[2]!=null && el.getAttribute('data-tam') == restricao2[tamanho]){
                flag++;
            }
        }


        if(estadoRestricao2[contorno] != null && estadoRestricao2[contorno] == 'Aceito'){
            if(restricao2[3]!=null && el.getAttribute('data-cont') != restricao2[contorno]){
                flag++;
            }
        }
        if(estadoRestricao2[contorno] != null && estadoRestricao2[contorno] == 'Negado'){
            if(restricao2[3]!=null && el.getAttribute('data-cont') == restricao2[contorno]){
                flag++;
            }
        }

       if(letra == 's'){
           imgMov2[contador] = flag;	
       }

       contador++;
       aux = aux + flag;
   });

   return aux;
}
var arrayPos = [];
//var nodeImg;
function resolver(){    //Reconhece onde colocar as imagens pelo fluxograma
    var divForms = document.getElementById(divFormas);
    var newDivForms = pegarFilhos();
    newDivForms = pegarNome(newDivForms)
	var resposta = '';
    var contador = 3;
    
    for (let forma of newDivForms) {
        var caminhar = new Array();
        var caminhoTotal = new Array();
        var form = forma[0];
        var cor = forma[1];
        var tamanho = forma[2];
        var borda = forma[3];
        var caminho = './img/' + form + cor + tamanho + borda + '.svg';
        var inicio = child1.getOutgoingLinks();
        var proximoNode = inicio[0].getDestination();
        var nodeTexto = proximoNode.getText();
        var formaProximoNode = proximoNode.getShape().getId();
        var capX = 4;
        var capY = 5;

        if (form == 'R') {
            var nodeImg = diagram.getFactory().createShapeNode(1, 1, 6, 10);
            nodeImg.setImageLocation(caminho);
        } else if (form == 'C') {
            var nodeImg = diagram.getFactory().createShapeNode(1, 1, 10, 10);
            nodeImg.setShape('Ellipse');
            nodeImg.setImageLocation(caminho);
        } else if (form == 'T') {
            var nodeImg = diagram.getFactory().createShapeNode(1, 1, 14, 10);
            nodeImg.setShape('Triangle');
            nodeImg.setImageLocation(caminho);
        } else {
            var nodeImg = diagram.getFactory().createShapeNode(1, 1, 10, 10);
            nodeImg.setImageLocation(caminho);
        }

        //coloca o node no node Start
        nodeImg.bounds.x = child1.getCenter().x + capX;
        nodeImg.bounds.y = child1.getCenter().y - capY;

        caminhar.push(inicio[0].getDestination())
        while (nodeTexto != 'Fim') {
            var formaAtual = divForms.childNodes[contador];
            if (formaProximoNode == 'Decision') {
                if (nodeTexto.includes('retângulo')) {
                    if (form == 'R') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                        arrayPos.push([proximoNode.getCenter().x + capX, proximoNode.getCenter().y - capY]);
                    }
                    else if (form != 'R') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                        arrayPos.push([proximoNode.getCenter().x + capX, proximoNode.getCenter().y - capY]);
                    }
                }
                else if (nodeTexto.includes('círculo')) {
                    if (form == 'C') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (form != 'C') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('triângulo')) {
                    if (form == 'T') {
                        var nodeSim = pegarProximoNode(proximoNode,0)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (form != 'T') {
                        var nodeNao = pegarProximoNode(proximoNode,1)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('quadrado')) {
                    if (form == 'Q') {
                        var nodeSim = pegarProximoNode(proximoNode,0)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (form != 'Q') {
                        var nodeNao = pegarProximoNode(proximoNode,1)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('amarelo')) {
                    if (cor == 'A') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (cor != 'A') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('vermelho')) {
                    if (cor == 'V') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (cor != 'V') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('azul')) {
                    if (cor == 'Z') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (cor != 'Z') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('grande')) {
                    if (tamanho == 'G') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (tamanho != 'G') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('pequeno')) {
                    if (tamanho == 'P') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (tamanho != 'P') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
                else if (nodeTexto.includes('borda')) {
                    if (borda == 'C') {
                        var nodeSim = pegarProximoNode(proximoNode)[0];
                        proximoNode = nodeSim;
                        nodeTexto = nodeSim.getText();
                        formaProximoNode = nodeSim.getShape().getId();
                    } else if (borda != 'C') {
                        var nodeNao = pegarProximoNode(proximoNode)[1];
                        proximoNode = nodeNao;
                        nodeTexto = nodeNao.getText();
                        formaProximoNode = nodeNao.getShape().getId();
                    }
                }
            }
            else if (formaProximoNode == 'Rectangle') {
                resposta = resposta + ' ' + nodeTexto + '\n'
                var nodeStep = pegarProximoNode(proximoNode);
                proximoNode = nodeStep;
                nodeTexto = nodeStep.getText();
                formaProximoNode = nodeStep.getShape().getId();
                arrayPos.push([proximoNode.getCenter().x + capX, proximoNode.getCenter().y - capY]);
            }
            if (colocarImg(nodeTexto,formaAtual,divForms,contador)){
                contador--
            }
            caminhar.push(proximoNode)
        }
        contador++;
        anima(nodeImg,caminhar,nodeTexto)
	}
}
var tempo = 100;
var tempoAdicional = 2000;
function anima(nodeImg, caminhar, nodeTexto) {
    var cam = caminhar.shift();
    if (cam != null) {
        if (cam.getText() == 'Fim') {
            setTimeout(function () { animacao(nodeImg, cam); console.log("Passei no node:", cam.getText()) }, tempo);
            tempo = tempo + tempoAdicional;
            setTimeout(function () { diagram.removeItem(nodeImg) }, tempo);
            anima(nodeImg, caminhar, nodeTexto);
        } else {
            setTimeout(function () { animacao(nodeImg, cam); console.log("Passei no node:", cam.getText()) }, tempo);
            tempo = tempo + tempoAdicional;
            anima(nodeImg, caminhar, nodeTexto);
        }
    } else if (cam == null) {
        setTimeout(function () { tempo = 100 }, tempo);
    }
}
function colocarImg(nodeTexto,formaAtual,divForms,contador){ //Coloca as imagens na suas dropzones de acordo com o fluxograma
    var dropEsquerda = document.getElementById(dropPrimeiro);
    var dropDireita = document.getElementById(dropTerceiro);
    var dropMeio = document.getElementById(dropSegundo);

    if (nodeTexto == "Colocar na direita") {
        var img = criarImg(formaAtual.getAttribute('data-tipo'), formaAtual.getAttribute('data-cor'), formaAtual.getAttribute('data-tam'), formaAtual.getAttribute('data-cont'))
        dropDireita.appendChild(img)
        divForms.removeChild(formaAtual)
        contador--;
        return true
    }
    else if (nodeTexto == "Colocar na esquerda") {
        var img = criarImg(formaAtual.getAttribute('data-tipo'), formaAtual.getAttribute('data-cor'), formaAtual.getAttribute('data-tam'), formaAtual.getAttribute('data-cont'))
        dropEsquerda.appendChild(img);
        divForms.removeChild(formaAtual)
        contador--;
        return true
    }
    else if (nodeTexto == "Colocar na intercessão") {
        var img = criarImg(formaAtual.getAttribute('data-tipo'), formaAtual.getAttribute('data-cor'), formaAtual.getAttribute('data-tam'), formaAtual.getAttribute('data-cont'))
        dropMeio.appendChild(img);
        divForms.removeChild(formaAtual)
        contador--;
        return true
    }
}

function calculaPos(animation, animationProgress) {
	var bounds = animation.item.getBounds().clone();
	var x = animation.getFromValue();
	var y = animation.getToValue();
    var x1 = animation.item.getBounds().x;
    var y1 = animation.item.getBounds().y;
	bounds.x = x1 + (x - x1) * animationProgress; //pointA.x + (pointB.x - pointA.x) * animationProgress;
	bounds.y = y1 + (y - y1) * animationProgress; //pointA.y + (pointB.y - pointA.y) * animationProgress;
	animation.item.setBounds(bounds, true);
}

function animacao(node, proxNode)
{
	var options =
	{
		duration: 2000,
		fromValue: proxNode.getCenter().x,
		toValue: proxNode.getCenter().y
	};

    var animation = new Animation(node, options, calculaPos, null);
    animation.start();
}

function criarImg(forma,cor,tamanho,contorno){ //Cria uma nova imagem 
    var img = document.createElement("img");
    var tam;
    img.setAttribute('data-tipo',forma);
    img.setAttribute('data-cor',cor);
    img.setAttribute('data-tam',tamanho);
    img.setAttribute('data-cont',contorno);
    if(tamanho == 0){
        tam = "grande"
    }
    else if(tamanho == 1){
        tam = "pequeno"
    }
    img.setAttribute('class','drag game-img '+tam)
    var src = getImgScr(forma,cor,tamanho,contorno);
    img.setAttribute('src',src);
    var alt = getImgAlt(img);
    img.setAttribute('alt',alt);
    img.setAttribute('title',alt)
    img.setAttribute('tabindex',0)
    return img
}

//Decide pra qual node vai o "ponteiro"
function pegarProximoNode(proximoNode,sentido){
    var linkProximoNode = proximoNode.getOutgoingLinks();
    var nodeFim = linkProximoNode[0].getDestination();
    var node = [];
    var nodep
    for (let l of linkProximoNode){
        if (l.getText() == 'SIM'){
            node.push(l.getDestination());
            
        }
        if (l.getText() == 'NÂO'){
            node.push(l.getDestination())
        }
    }
    /*if (sentido == 0){
        nodep = node[0]
    }
    else{
        nodep = node[1]
    }*/
    if (nodeFim.getText() == 'Fim')
    {
        return nodeFim;
    }
    else{
        return node;
    }
}

function check(){ //Confere se acertou
    let flag1 = 0, flag2 = 0, flag3 = 0, lixo, mov = 0;
    imgMov1 = [];
    imgMov2 = [];
    var imagensDropPrimeiro = document.getElementById(dropPrimeiro).getElementsByTagName('img');
    var imagensDropSegundo = document.getElementById(dropSegundo).getElementsByTagName('img');
    var imagensDropTerceiro = document.getElementById(dropTerceiro).getElementsByTagName('img');
    var imagensGeradas = document.getElementById(divFormas).getElementsByTagName('img');
    var textoAcerto = document.getElementById('resultado-jogo');
    var textoErro = document.getElementById('resultadoNegativo-jogo')

    var modalAcerto = document.getElementById("modalAcerto");
    var modalErro = document.getElementById('modalErro');

    var botaoOk = document.getElementById('botao-proximo');    

    /*Verifica se as caixas estão corretas e se todas as imagens corretas foram movidas */
   flag1 = first(imagensDropPrimeiro, 'n');
   flag3 = third(imagensDropTerceiro, 'n');


   /* Confere se a imagem não pertence aos dois*/
   if(quantidade != 2){

        flag2 = first(imagensDropSegundo, 'n') + third(imagensDropSegundo, 'n');

        if(imagensDropPrimeiro.length != 0){

            lixo = third(imagensDropPrimeiro, 's')
            imgMov2.forEach(el => {
                if(el == 0){
                    flag1++;
                }	
    
           });
        }
        
        if(imagensDropTerceiro.length != 0){

            lixo = first(imagensDropTerceiro, 's')
            imgMov1.forEach(el => {
                if(el == 0){
                    flag3++;
                }	
    
           });
        }
   }

   /*confere se ainda há opções*/
   if(imagensGeradas.length != 0){

       lixo = first(imagensGeradas, 's');
       lixo = third(imagensGeradas, 's');

       /*Analisa as flags.
       Se a flag da determinada imagem for 0, significa que ela está correta e deve ser movida*/
       imgMov1.forEach(el => {

            if(el == 0){
                mov++;
            }	

       });

       imgMov2.forEach(el => {
       
            if(el == 0){
                mov++;
            }	

       });
   }
    /*Verifica todas as situações de resposta*/
    if (mov != 0) {

        console.warn('n movi todas')
        modalErro.style.display = 'block';
        textoErro.innerText = 'Você ainda não moveu todas as imagens... Tente novamente.';
   
    } else {
        if (flag1 == 0 && flag2 == 0 && flag3 == 0) {
            if(endGame == false){
            
                modalAcerto.style.display = 'block';
                textoAcerto.innerText = 'Você acertou! Fase concluída.';
                botaoOk.innerHTML = "Próxima"; 
                botaoOk.onclick = function (event){
                    etapaAtual +=1; //////////////////////////////////////////////////////////////////////////////////////////////////////
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
                            arrayEstrelas[0].setAttribute('src', './img/estrelas/star1.svg');
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
                            arrayEstrelas[1].setAttribute('src', './img/estrelas/star1.svg');
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
                            arrayEstrelas[2].setAttribute('src', './img/estrelas/star1.svg');
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
                            arrayEstrelas[3].setAttribute('src', './img/estrelas/star1.svg');
                            var texto = document.getElementById('texto4');
                            texto.innerHTML = etapaAtual.toString() + "/40";
                            break;
                        default:
                            break;
                    }
                    game();
                    modalAcerto.style.display = 'none';
                }
            } 
            else{
                textoAcerto.innerHTML = "Você concluiu o jogo! Parabens!";
                botaoOk.innerHTML = "Reiniciar";
                modalAcerto.style.display = 'block';
                botaoOk.onclick = function (event){
                    etapaAtual = 0;
                    endGame = false;
                    resetEstrelas();
                    game();
                    modalAcerto.style.display = 'none';
                };
            }
        }else {
            
            modalErro.style.display = 'block';
            textoErro.innerText = 'Resposta errada... Tente novamente!';
        }
    }
}

function resetFlux(){
    primeiraRodada = false;
    game()
}

// CÓDIGO REFETENTE AO FLUXOGRAMA
/// <reference path="Scripts/jspack-vsdoc.js" />

var AbstractionLayer = MindFusion.AbstractionLayer;
var Style = MindFusion.Diagramming.Style;
var Theme = MindFusion.Diagramming.Theme;
var Diagram = MindFusion.Diagramming.Diagram;
var Rect = MindFusion.Drawing.Rect;
var DashStyle = MindFusion.Drawing.DashStyle;
var Events = MindFusion.Diagramming.Events;
var Animation = MindFusion.Animations.Animation;
var child7, child1, child2, stepNode3;
var Font = MindFusion.Drawing.Font;

var diagram;
var backgroundColor, linkDashStyle, baseShape, headShape, headBrush, nodeImg;

function createDiagram(rest1,rest2,type1,type2,inter)
{	
     backgroundColor = "#f2ebcf";
	 linkDashStyle = DashStyle.Solid; 
	 baseShape = null;
	 headShape = "Triangle";
	 headBrush = "#7F7F7F";

	// Criação do componente diagrama
	diagram = AbstractionLayer.createControl(Diagram, null, null, null, $("#diagram")[0]);
	diagram.setAllowInplaceEdit(false);
	diagram.setRouteLinks(false);
	diagram.setShowGrid(false);
	diagram.setUndoEnabled(true);
    diagram.setRoundedLinks(false);
    diagram.setAutoResize(false);
	diagram.setBounds(new Rect(0, 0, 140,100));

	var theme = new Theme();
	var shapeNodeStyle = new Style();
	shapeNodeStyle.setBrush({ type: 'SolidBrush', color: '#f2ebcf' });
	shapeNodeStyle.setStroke("#7F7F7F");
	shapeNodeStyle.setTextColor("#585A5C");
	shapeNodeStyle.setFontName("Verdana");
    shapeNodeStyle.setFontSize(3);
    shapeNodeStyle.setShadowColor('');
	theme.styles["std:ShapeNode"] = shapeNodeStyle;
	var linkStyle = new Style();
	linkStyle.setStroke("#7F7F7F");
	linkStyle.setStrokeThickness(1.0);
	linkStyle.setTextColor("#585A5C");
	linkStyle.setFontName("Verdana");
	linkStyle.setFontSize(3);
	theme.styles["std:DiagramLink"] = linkStyle;
	diagram.setTheme(theme);	

	diagram.addEventListener(Events.linkCreated, onLinkCreated);
    iniciarDiagrama(rest1,rest2,type1,type2,inter)
    
};

function startDiagrama(rest1,rest2,type1,type2,inter){
    iniciarDiagrama(rest1,rest2,type1,type2,inter)
}

function iniciarDiagrama(rest1, rest2, type1, type2, inter) {
    var largura = 22;
    var altura = largura * 0.75;
    var espacoy = 2;
    var formas = [];

    for (i = 0; i < rest1.length; i++) {
        switch (parseInt(type1[i])) {
            case 0:
                switch (parseInt(rest1[i])) {
                    case 0: rest1[i] = "É triângulo"; break;
                    case 1: rest1[i] = "É quadrado"; break;
                    case 2: rest1[i] = "É retângulo"; break;
                    case 3: rest1[i] = "É círculo"; break;
                }
                ;
            case 1:
                switch (parseInt(rest1[i])) {
                    case 0: rest1[i] = "É azul"; break;
                    case 1: rest1[i] = "É vermelho"; break;
                    case 2: rest1[i] = "É amarelo"; break;
                }
                ;
            case 2:
                switch (parseInt(rest1[i])) {
                    case 0: rest1[i] = "É grande"; break;
                    case 1: rest1[i] = "É pequeno"; break;
                }
                ;
            case 3:
                switch (parseInt(rest1[i])) {
                    case 0: rest1[i] = "tem borda"; break;
                    case 1: rest1[i] = "tem borda"; break;
                }
                ;
        }
    }
    for (i = 0; i < rest2.length; i++) {
        switch (parseInt(type2[i])) {
            case 0:
                switch (parseInt(rest2[i])) {
                    case 0: rest2[i] = "É triângulo"; break;
                    case 1: rest2[i] = "É quadrado"; break;
                    case 2: rest2[i] = "É retângulo"; break;
                    case 3: rest2[i] = "É círculo"; break;
                }
                ;
            case 1:
                switch (parseInt(rest2[i])) {
                    case 0: rest2[i] = "É azul"; break;
                    case 1: rest2[i] = "É vermelho"; break;
                    case 2: rest2[i] = "É amarelo"; break;
                }
                ;
            case 2:
                switch (parseInt(rest2[i])) {
                    case 0: rest2[i] = "É grande"; break;
                    case 1: rest2[i] = "É pequeno"; break;
                }
                ;
            case 3:
                switch (parseInt(rest2[i])) {
                    case 0: rest2[i] = "tem borda"; break;
                    case 1: rest2[i] = "tem borda"; break;
                }
                ;
        }
    }

    for (let forma of rest1) {
        formas.push(forma);
    }
    for (let forma of rest2) {
        formas.push(forma);
        if (inter) {
            formas.push(forma);
        }
    }
    var corNode = '#fbfc97';
    var corDireita = '#fff5e6';
    var corEsquerda = '#ecf8f9';
    var corInter = '#eeefe1';
    var corFimInicio = '#7ee0e0';
    var corDescarta = '#ccff66';
    var fonte = new Font("sans-serif", 3, true, false);
    
    if (inter) {
        var decisionNode1 = diagram.getFactory().createShapeNode(45, 100 - (altura * 2) - (espacoy), largura, altura * 0.66);
        decisionNode1.setBrush(corInter);
        decisionNode1.setFont(fonte); 
        decisionNode1.setText("Colocar na interseção");
    }
    child7 = diagram.getFactory().createShapeNode(67, 100 - (altura * 2 - espacoy * 6), largura * 0.75, altura * 0.66);
    child7.setBrush(corFimInicio);
    child7.setFont(fonte);
    child7.setText("FIM");

    // cria o node start
    child1 = diagram.getFactory().createShapeNode(67,1, largura * 0.75, altura * 0.66); //Parâmetros [x, y, largura, altura]
    child1.setShape('Ellipse');
    child1.setBrush(corFimInicio);
    child1.setFont(fonte);
    child1.setText("INÍCIO");

    // cria os nodes de passos
    var child2 = diagram.getFactory().createShapeNode(10, 100 - (altura * 2) - (espacoy), largura, altura * 0.66);
    child2.setBrush(corEsquerda);
    child2.setFont(fonte);
    child2.setText("Colocar na esquerda");

    var child5 = diagram.getFactory().createShapeNode(115, 100 - (altura * 2) - (espacoy), largura, altura * 0.66);
    child5.setBrush(corDireita);
    child5.setFont(fonte);
    child5.setText("Colocar na direita");

    var child6 = diagram.getFactory().createShapeNode(85, 100 - (altura * 2) - (espacoy), largura, altura * 0.66);
    child6.setFont(fonte);
    child6.setBrush(corDescarta);
    child6.setText("Não mover");

    

    for (i = 0; i < formas.length; i++) {
        switch (parseInt(i)) {
            case 0: var decisionNode1 = diagram.getFactory().createShapeNode(67 - largura / 10, altura * (1), largura, altura);; break;
            case 1: if (rest1.length > 1) {
                var decisionNode1 = diagram.getFactory().createShapeNode(30, altura * (1.75), largura, altura);
            }
            else {
                var decisionNode1 = diagram.getFactory().createShapeNode(85, altura * (1.75), largura, altura);
            }
                break;
            case 2: if (rest1.length > 1) {
                var decisionNode1 = diagram.getFactory().createShapeNode(85, altura * (1.75), largura, altura);
            }
            else {
                var decisionNode1 = diagram.getFactory().createShapeNode(45, altura * (1.75) - espacoy, largura, altura);
            }
                ; break;
            case 3: if (rest1.length > 1) {
                var decisionNode1 = diagram.getFactory().createShapeNode(45, altura * (2.75) - espacoy, largura, altura);
            }
            else {
                var decisionNode1 = diagram.getFactory().createShapeNode(30, altura * (2.75), largura, altura);
            }
                ; break;
            case 4: if (rest1.length > 1) {
                var decisionNode1 = diagram.getFactory().createShapeNode(85, altura * (2.75), largura, altura);
            }
            else {
                var decisionNode1 = diagram.getFactory().createShapeNode(45, altura * (2.75) - espacoy, largura, altura);
            }
                ; break;
        }
        decisionNode1.setShape('Decision');
	decisionNode1.setBrush(corNode);
        decisionNode1.setFont(fonte);
        decisionNode1.setText(formas[i]);
    }
}

function removeDiagram(){       //Apagando diagrama
    diagram.clearAll()
}

function onLinkCreated(sender, args) {      //Criação do link
    var link = args.getLink();
    var origem = link.getOrigin();
    var formaOrigem = origem.getShape().getId();
    link.setTextAlignment(MindFusion.Diagramming.Alignment.Far);

    //Ao se criar o link verifica se o node origem do link é um nodeShape 'DECISION' e adiciona o texto SIM ao primeiro link criado ou NÂO caso exista um SIM
    if (formaOrigem =='Decision') {
        for (let l of origem.getOutgoingLinks()) {
            if (l.getText() == '') {
                link.setText('SIM');
            } else if (l.getText() == 'SIM') {
                link.setText('NÂO');
            }
        }
    }
}

document.body.onload = game();
var botaoResultado = document.getElementById('botao-resultado');
botaoResultado.addEventListener('click', check);


