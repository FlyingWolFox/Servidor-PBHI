/** CONSTANTES DO SCRIPT **/

// IDs dos containers
const divSequencia = 'container_nucleo';
const divOpcoes = 'container_formas';
const divCaixa = 'container_sequencia';
const textNumeroFase = 'textbox_numero_fase';
const divEstrelas = 'conquistas_conteiner';

const anosEnum = Object.freeze({
	"Primeiro ano": 1,
	"Segundo ano": 2,
	"Terceiro ano": 3,
	"Quarto ano": 4,
	"Quinto ano": 5,
	"Sexto ano": 6
});

const coresEnum = Object.freeze({
	"azul": 0,
	"rosa": 1,
	"amarelo": 2,
	"verde": 3
});
/** FIM CONSTANTES */

/** VARIAVEIS GLOBAIS COMPARTILHADAS ENTRE AS FUNCOES */

var arrayCaixa = []; //Elementos colocados na caixa de resposta
var arrayNucleo = []; //Array para guardar o nucleo
var tamSeq = 0; //Tamanho da sequência do núcleo
var arraySequencia = []; //Array para guardar a sequecia
var arrayOpcoes = []; //Array contendo todos os elementos gerados nas opcoes
var tamNucleo; //Quantos elementos o nucleo possui
var nSlots; //quantas vezes o nucleo se repete na resposta
var etapaAtual = 0;
var estrela = 0; //nível de estrelas do jogador 
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');
var ano = localStorage.getItem('ano');
var etapaMax = 17;
console.log('esse eh o ano:' + ano);
/** FIM VARIAVEIS */



/** FUNCOES DE APOIO */

function getFasesPorAno(){
	switch(ano){
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
function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
  }
function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** FIM FUNCOES DE APOIO */

/** FUNCOES DO JOGO */
function getImgScr(numero, cor) {
	var src = '../img/fig-num/';

	switch (numero) {
		case 0:
			src += '0';
			break;
		case 1:
			src += '1';
			break;
		case 2:
			src += '2';
			break;
		case 3:
			src += '3';
			break;
		case 4:
			src += '4';
			break;
		case 5:
			src += '5';
			break;
		case 6:
			src += '6';
			break;
		case 7:
			src += '7';
			break;
		case 8:
			src +='8';
			break;
		case 9:
			src += '9';
			break;	
	}	
	switch (cor) {
		case coresEnum.azul:
			src += 'Z';
			break;
		case coresEnum.amarelo:
			src += 'A';
			break;
		case coresEnum.rosa:
			src += 'R';
			break;
		case coresEnum.verde:
			src += 'V';	
	}

	src += '.svg';

	return src;
}

function getImgAlt(img) {
	var alt = '';

	switch (parseInt(img.getAttribute('numero'))) {
		case 0:
			alt += '0';
			break;
		case 1:
			alt += '1';
			break;
		case 2:
			alt += '2';
			break;
		case 3:
			alt += '3';
			break;
		case 4:
			alt += '4';
			break;
		case 5:
			alt += '5';
			break;
		case 6:
			alt += '6';
			break;
		case 7:
			alt += '7';
			break;
		case 8:
			alt += '8';
			break;
		case 9:
			alt += '9';
			break;
	}

	
	alt += '.';

	return alt;
}

function removeChildElementsByTag(parent, tag) {
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
function novaImgNumerosSequencia(i, numeroRef, razaoSequencia, cor){
	
	switch(razaoSequencia){
		case 2:
			i = i*2;
			break;
		case -1:
			i = i * (-1);
			break;
		case -2:
			i = (i*2) * (-1);
			break;		
		default:
			i = i;
			break;
	}
	var novaImg  = document.createElement("img");
	var arq;

	console.log('numero inicial: ' + numeroRef+i);

	arq = getImgScr(numeroRef+i,cor);
	novaImg.setAttribute('src', arq);
	novaImg.setAttribute('numero', numeroRef+i);
	novaImg.setAttribute('alt', getImgAlt(novaImg));
	novaImg.setAttribute('title', novaImg.getAttribute('alt'));
	novaImg.classList.add('game-img');
	


	console.log('novaimg: numero=' + numeroRef+i + ', src=' + arq);

	return novaImg;


}
function novaImgBlocoLogicoComRestricoes(arrayPecasExistentes, maxNumeros, cor) {
	var novaImg = document.createElement("img");
	var i, arq, numero;
	var numeroUsado = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var numerosUsados = 0;

	if (arrayPecasExistentes.length != 0) {
		//preencher caracteristicas usadas
		console.log('verificar caracteristicas usadas');
		for (i = 0; i < arrayPecasExistentes.length; i++) {
			if(arrayPecasExistentes[i] == null)
				continue;
			numerosUsados  += numeroUsado[arrayPecasExistentes[i].getAttribute('numero')] == 1 ? 0: 1;
			numeroUsado[arrayPecasExistentes[i].getAttribute('numero')] = 1;
			console.log('peca verificada');
		}
	}

	for(i = 0; i < maxNumeros; i++){
		numero = getRandomIntInclusive(0, 9);
	}
	//escolher numero
		/*console.log('numeros usados = ' + numerosUsados);
		for (i = 0; i < numeroUsado.length; i++) {
			console.log(i + ' = ' + numeroUsado[i]);
		}
		while(1){
			numero = getRandomIntInclusive(0, 9);
			if (numerosUsados < maxNumeros && !numeroUsado[numero]) {
				//se ainda nao escolheu todos os numeros e eh um novo numero
				break;
			}
			if (numerosUsados >= maxNumeros && numeroUsado[numero]) {
				//se ja escolheu todas os numeros e eh numero ja usado
				break;
			}
		}
		
	} else {
		//array vazio
		console.log('array de imgs estava vazio');
		numero = getRandomIntInclusive(0, 9);
	}
*/
	
	arq = getImgScr(numero, cor);
	novaImg.setAttribute('src', arq);
	novaImg.setAttribute('numero', numero);
	novaImg.setAttribute('alt', getImgAlt(novaImg));
	novaImg.setAttribute('title', novaImg.getAttribute('alt'));
	novaImg.classList.add('game-img');
	


	console.log('novaimg: numero=' + numero + ', src=' + arq);

	return novaImg;
}

function reset() {
	removeChildElementsByTag(divSequencia, 'img');
	removeChildElementsByTag(divOpcoes, 'img');
	removeChildElementsByTag(divOpcoes, 'div');
	removeChildElementsByTag(divSequencia, "div");
	arrayCaixa = [];
	arrayNucleo = [];
	arraySequencia = [];
	arrayOpcoes = [];
	tamNucleo = 0;
	tamNuc = 0;
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
endGame = false;

function checaOcorrencia(array, elemento){
	var count = 0;
	array.forEach((v) => (v === elemento && count++));
	return count;
}

function substituiImgs(nSequencia, etapaAtual, nSlots) {
	
	var divNuc = document.getElementById(divSequencia);
	var childNucleo = divNuc.children;
	var divOps = document.getElementById(divOpcoes);
	var arraySlots = [];
	var imgSubstituida = [];
	var indices = [];

	for (var i = 0; i < nSlots; i++) {
		if(etapaAtual < 12){// desvio condicional pra separar os jogos, A2
			indices[i] = (arraySequencia.length - i) - 1;
			console.log("valor de nSlots:" + nSlots);
			imgSubstituida[i] = arraySequencia[indices[i]] //armazena a imagem substituida
			arraySlots[i] = document.createElement("div"); //cria um elemento div com propriedas de drop pra ficar no lugar da imagem substituida
			arraySlots[i].setAttribute('id', 'substituta' + i);
			arraySlots[i].classList.add("dropzone");
			arraySlots[i].classList.add("slot");
			arraySequencia[indices[i]] = arraySlots[i]; //adiciona o elemento div no lugar da imagem 
			childNucleo[indices[i]].replaceWith(arraySequencia[indices[i]]); // adiciona o slot na zona dquencia
			//divOps.appendChild(imgSubstituida[i]); // adiciona a imagem substituida nas opções do jogadore se

		}else{// A3
			console.log("entrei no else");
			var testeindice = randomInteger(0, nSequencia - 1); //descobre qual o indice do array sequencia vai ter sua imagem substituida
			var repetida = indices.includes(testeindice); //verifica se o indice ja foi utilizado
			while(repetida){//se o indice ja foi utilizado, procura outro indice pra ser substituido
				testeindice = randomInteger(0, nSequencia - 1);
				repetida = indices.includes(testeindice);
			}
			indices[i] = testeindice;
			console.log("valor de nSlots:" + nSlots);
			imgSubstituida[i] = arraySequencia[indices[i]] //armazena a imagem substituida
			arraySlots[i] = document.createElement("div"); //cria um elemento div com propriedas de drop pra ficar no lugar da imagem substituida
			arraySlots[i].setAttribute('id', 'substituta' + i);
			arraySlots[i].classList.add("dropzone");
			arraySlots[i].classList.add("slot"); 
			arraySequencia[indices[i]] = arraySlots[i]; //adiciona o elemento div no lugar da imagem 
			childNucleo[indices[i]].replaceWith(arraySequencia[indices[i]]); // adiciona o slot na zona dquencia
			//divOps.appendChild(imgSubstituida[i]); // adiciona a imagem substituida nas opções do jogadore se
		}
	}
	console.log("tamanho do arraySlots:" + arraySlots.length);

	var divOpsAux = divOps.children;
	var arrayOpsAux = Array.from(divOpsAux);
	//variaveis responsaveis por controlar o numero de ocorrencias das imagens corretas na resposta e nas opções:
	var descricaoElementosOps = []; //array que armazena a descricao das imgs das opcoes
	var nOcorrenciasOps = [];
	var descricaoElementosSubs = []; //array que armazena a descricao das imgs substituidas
	var difOcorrencias = [];
	var nOcorrenciasSubs = [];

	arrayOpsAux.forEach((el, j) => {
		descricaoElementosOps[j] = el.getAttribute('alt');
		el.setAttribute('usada', 'nao'); // atributo pra verificar se essa imagem ja foi usada como substituta 
	})

	imgSubstituida.forEach((el, j) => {
		descricaoElementosSubs[j] = el.getAttribute('alt');
	})

	for(var i = 0; i < imgSubstituida.length; i++){
		nOcorrenciasSubs[i] = checaOcorrencia(descricaoElementosSubs,imgSubstituida[i].getAttribute('alt'));
		console.log(nOcorrenciasSubs[i] + " Ocorrencias da img substituida:" + imgSubstituida[i].getAttribute('alt'));
		nOcorrenciasOps[i] = checaOcorrencia(descricaoElementosOps, imgSubstituida[i].getAttribute('alt'));
		console.log(nOcorrenciasOps[i] + " Ocorrencias da img substituida nas opcoes:" + imgSubstituida[i].getAttribute('alt'));
	}

	for(var i = 0; i < imgSubstituida.length; i++){ // verifica o se o numero de ocorrencias de cada imagem correta eh o mesmo nas substituidas e nas opcoes, se nao for, procura uma imagem errada e substitui pela correta
		difOcorrencias[i] = nOcorrenciasSubs[i] - nOcorrenciasOps[i];
		while(difOcorrencias[i] > 0){
			console.log('faltam: ' + difOcorrencias[i] + ' da imagem: ' + imgSubstituida[i].getAttribute('alt'));
			for(var count = 0; count < arrayOpsAux.length; count++){
				var incluiElemento = descricaoElementosSubs.includes(arrayOpsAux[count].getAttribute('alt')); //verifica se a imagem a ser substituida nao é uma imagem correta
				if(!incluiElemento && difOcorrencias[i] > 0 && arrayOpsAux[count].getAttribute('usada') === 'nao'){
					arrayOpsAux[count].replaceWith(imgSubstituida[i]);
					arrayOpsAux[count].setAttribute('usada', 'sim');
					console.log("eu substitui a img: " + arrayOpsAux[count].getAttribute('alt') + "pela img:" + imgSubstituida[i].getAttribute("alt"));
					difOcorrencias[i]--;
					continue;
				}
		}	

		}
	}
}	


function shuffle(array) {
	var indexAtual = array.length, aux, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== indexAtual) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * indexAtual);
	  indexAtual -= 1;
  
	  // And swap it with the current element.
	  aux = array[indexAtual];
	  array[indexAtual] = array[randomIndex];
	  array[randomIndex] = aux;
	}
  
	return array;
  }
  
function chuva() {
	for (let i = 1; i < 50; i++) {
		let rand = Math.floor(Math.random() * document.body.clientWidth-20);
		let cor = Math.floor(Math.random() * 4)
		let rotate = Math.floor(Math.random() * 360)
		switch(cor){
			case 0:
				cor = '#fc21bf'
			break;
			case 1:
				cor = 'skyblue'
			break;
			case 2:
				cor = '#c400ff'
			break;
			case 3:
				cor = '#16fcab'
			break;
			case 4:
				cor = '#ff1616'
			break;
		}
		var confete = document.createElement('span');
		confete.classList.add('gota');
		confete.style.marginLeft = rand+'px'
		confete.style.backgroundColor = cor
		confete.style.transform = 'rotate('+rotate+'deg)'
		confete.style.setProperty('animation-delay', 0.1*i + 's');
		document.querySelector('body').append(confete);
	}
}

function stopChuva(){
    var filhos = document.querySelector('body').querySelectorAll('.gota')
    filhos.forEach(filho => {
        filho.parentElement.removeChild(filho)
    })
}

function game() {
	reset();
	
	
	//iniciar variaveis de controle
	
	var tamOpcoes = 0; //quantidade de opções de resposta
	var numeroRef = 0; // numero inicial de referencia onde a sequencia começa, utilizar baseado no tamSequencia
	var razaoSequencia = 0; //razão entre os numeros da sequencia, pode ser 1, 2, -1 ou -2, utilizar ela baseado no tamSequencia
	var i, j, escolhido, achouIgual;
	arrayOriginal = [];
	

	var textNumeroFaseDom = document.getElementById(textNumeroFase);
	textNumeroFaseDom.innerHTML = (etapaAtual + 1);


	//setar os valores das variaveis de controle de acordo com a etapa/fase
	switch (etapaAtual) {
		case 0:
			/*Padronizado*/
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(1,2);  
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 1:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(3,4);
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 2:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(5,6);
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 3:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 2;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(6,7);
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 4:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(1,5);
			razaoSequencia = 1;
			numerosDistintos = 3;
			break;
		case 5:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(3,6);
			razaoSequencia = 1;
			numerosDistintos = 3;
			break;
		case 6:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(1,2);
			razaoSequencia = 2;
			numerosDistintos = 3;
			break;
		case 7:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(3,4);
			razaoSequencia = 2;
			numerosDistintos = 3;
			break;
		case 8:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(4,5);
			razaoSequencia = 2;
			numerosDistintos = 3;
			break;
		case 9:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 4;
			tamOpcoes = 4;
			numeroRef = getRandomIntInclusive(1,2);
			razaoSequencia = 1;
			numerosDistintos = 4;
			break;
		case 10:	
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 4;
			tamOpcoes = 4;
			numeroRef = getRandomIntInclusive(3,5);
			razaoSequencia = 1; 
			numerosDistintos = 4;
			break;

		case 11:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 4;
			tamOpcoes = 4;
			numeroRef = getRandomIntInclusive(1,3);
			razaoSequencia = 2;
			numerosDistintos = 4;
			break;
		case 12://mesma lógica do 0
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(1,2);  
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 13:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(3,4);
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 14:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(5,6);
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 15:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 2;
			tamOpcoes = 2;
			numeroRef = getRandomIntInclusive(6,7);
			razaoSequencia = 1;
			numerosDistintos = 2;
			break;
		case 16:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(1,5);
			razaoSequencia = 1;
			numerosDistintos = 3;
			break;
		case 17:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(3,6);
			razaoSequencia = 1;
			numerosDistintos = 3;
			break;
		case 18:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(1,2);
			razaoSequencia = 2;
			numerosDistintos = 3;
			break;
		case 19:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(3,4);
			razaoSequencia = 2;
			numerosDistintos = 3;
			break;
		case 20:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 3;
			tamOpcoes = 3;
			numeroRef = getRandomIntInclusive(4,5);
			razaoSequencia = 2;
			numerosDistintos = 3;
			break;
		case 21:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 4;
			tamOpcoes = 4;
			numeroRef = getRandomIntInclusive(1,2);
			razaoSequencia = 1;
			numerosDistintos = 4;
			break;
		case 22:	
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 4;
			tamOpcoes = 4;
			numeroRef = getRandomIntInclusive(3,5);
			razaoSequencia = 1; 
			numerosDistintos = 4;
			break;

		case 23:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 4;
			tamOpcoes = 4;
			numeroRef = getRandomIntInclusive(1,3);
			razaoSequencia = 2;
			numerosDistintos = 4;
			endGame = true;
			break;
		default:
			alert("Fim do Jogo! Parabens!");
			break;
	}
	//montar nucleo
	console.log("montar nucleo");
	var cor = getRandomIntInclusive(0,3);
	for(var i = 0; i<tamSeq; i++){
	arrayNucleo[i] = novaImgNumerosSequencia(i,numeroRef,razaoSequencia, cor);
	}
	

	

	//adicionar sequencia no div
	var divNucleo = document.getElementById(divSequencia); //div responsável pela sequencia do nucleo
	if (divNucleo == null) {
		alert("divnucleo null");
	}
	var seqAtual = 0;
	while (seqAtual < tamSeq) {
			arraySequencia[seqAtual] = document.createElement("img");
			arraySequencia[seqAtual].setAttribute('id', 'seq' + (seqAtual + 1));
			arraySequencia[seqAtual].setAttribute('src', arrayNucleo[seqAtual].getAttribute("src"));
			arraySequencia[seqAtual].setAttribute('alt', arrayNucleo[seqAtual].getAttribute("alt"));
			arraySequencia[seqAtual].setAttribute('title', arrayNucleo[seqAtual].getAttribute("title"));
			arraySequencia[seqAtual].classList.add('game-img');
			divNucleo.appendChild(arraySequencia[seqAtual]);
			arrayOriginal.push(arraySequencia[seqAtual])
			console.log('Adicionado seq #' + seqAtual + ': id=' + arraySequencia[seqAtual].getAttribute("id") + ', src=' + arraySequencia[seqAtual].getAttribute("src"));
			seqAtual++;
	}

	/* Atribui as imagens do núcleo em posicoes aleatorias do array */
	var divOps = document.getElementById(divOpcoes);
	var indice = [];

	//escolher indices TODO lincoln: ajeitar
	for (i = 0; i < tamNucleo; i++) {
		//loop infinito ate que as posicoes sejam distintas
		while (1) {
			indice[i] = getRandomIntInclusive(0, tamOpcoes - 1) //i;
			for (j = 0; j < i; j++) {
				if (indice[i] == indice[j]) {
					indice[i] = -1;
					break; //ja tinha um indice desse 
				}
			}
			if (indice[i] != -1)
				break; //indice escolhido ok
		}//Onde vai ficar as peças "forçadas"

		console.log('nucleo[' + i + '] ficara no indice: ' + indice[i]);
		//reativando 
		arrayOpcoes[indice[i]] = document.createElement("img");
		arrayOpcoes[indice[i]].setAttribute('src', arrayNucleo[i].getAttribute("src")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('numero', arrayNucleo[i].getAttribute("numero")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('alt', arrayNucleo[i].getAttribute("alt")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('title', arrayNucleo[i].getAttribute("title")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].classList.add('game-img');
		//reativando
	}

	//escolher demais opcoes de escolha
	console.log('escolher opcoes');
	for (i = 0; i < tamOpcoes; i++) { //Set imagens como opcoes, sendo uma delas o nucleo (arrayFigura[indice])
		if (arrayOpcoes[i] == null) {
			/*cria um elemento imagem e coloca a source*/
			var ehNovo = 0;
			while (!ehNovo) {
				ehNovo = 1;
				var novaOpcao = novaImgBlocoLogicoComRestricoes(arrayOpcoes, numerosDistintos, cor);
				for (j = 0; j < tamOpcoes; j++) {
					if (arrayOpcoes[j] != null && novaOpcao.getAttribute('src') == arrayOpcoes[j].getAttribute('src')) {
						ehNovo = 0;
						break;
					}
				}
			}
			arrayOpcoes[i] = novaOpcao;
			console.log('Adicionado forma/opcao #' + i + ': src=' + arrayOpcoes[i].getAttribute("src"));
		}

		arrayOpcoes[i].setAttribute('id', 'opcao' + (i + 1)); //lincoln: diferenciando ID
		divOps.appendChild(arrayOpcoes[i]);
		console.log('Adicionado forma/opcao parte2 #' + i + ': id=' + arrayOpcoes[i].getAttribute("id") + ', src=' + arrayOpcoes[i].getAttribute("src"));
	}
	substituiImgs(tamSeq, etapaAtual, nSlots);

	var auxOps = divOps.getElementsByTagName('img');
	var arrayOps = Array.from(auxOps);
	arrayOps = shuffle(arrayOps);
	for(i = 0; i < tamOpcoes; i++){
		divOps.appendChild(arrayOps[i]);
	}

}


function check() { //Verifica se acertou os elementos
	var correto = false; // Variável que funciona como indicador do acerto ou erro do usuário
	var acertos = 0; // número total de imagens que batem entre o resultado enviado pelo usuário e o array original. Esse valor precisa ser do tamanho do length do array original
	var resultado = document.getElementById(divSequencia).children; // Variável que armazena o estado da resposta do usuário no momento da chamada da função check()
	var arrayResultado = Array.from(resultado); // Variável que armazena o resultado o usuário como um array

	// Variaveis que selecionam os modais, seus textos e botões;

	var textoAcerto = document.getElementById('resultado-jogo');
    var textoErro = document.getElementById('resultadoNegativo-jogo')
    var modalAcerto = document.getElementById("modalAcerto");
    var modalErro = document.getElementById('modalErro');
	var modalFim = document.getElementById('modalFim')
	var btnReiniciar = document.getElementById('botao-restart')
	var botaoOk = document.getElementById('botao-proximo');


	// Comparar o resultado de cada item do arrayOriginal com o array resultado

	arrayResultado.forEach((el, i) => {

		// Primeira verificação = se o item tem um elemento filho.

		if(!el.hasChildNodes()){
			
			// Não possui elementos filho, logo pode ser uma imagem ou um slot que não foi preenchido

			let descricaoElemento = el.getAttribute('alt'); //descrição presente em todas as imagens do array de resposta
			let descricaoElementoOriginal = arrayOriginal[i].getAttribute('alt'); // descrição presente em todas as imagesn do array original da sequência

			if(descricaoElemento === null){

				// o elemento da vez não tem uma descrição do tipo alt, logo é um slot e não uma imagem;
				acertos--; // retira um número porque o usuário não completou a sequencia. tem espaço vazio.
				console.log(`tem um elemento faltando`);

			} 
			
			if(descricaoElemento == descricaoElementoOriginal) {

				acertos++ // a descrição das imagens coincidiram, então adiciona +1 a variável de acertos
				// se as imagens batem aqui, é porque já faziam parte do array original. Peças não movidas durante a montagem do jogo
				console.log(`o número ${i} Bateu certinho`);
			}

		} else {

			// possui um elemento filho, logo é um slot preenchido. É preciso verificar se as descrições batem para ter certeza que o usuário acertou a resposta

			let descricaoElemento = el.children[0].getAttribute('alt');
			let descricaoElementoOriginal = arrayOriginal[i].getAttribute('alt');

			if(descricaoElemento == descricaoElementoOriginal) {

				// descrição do primeiro filho do slot (img) bateu com a descrição da imagem de mesmo índicie do array original, logo o usuário acertou.

				console.log(`o número ${i} Bateu certinho`);
				acertos++; // as descrições bateram, logo conta como acerto para o usuário

 			} else {

				acertos--; // em um dos slots as descrições não bateram, logo tem alguma imagem fora do lugar e conta como erro para o usuário
				console.log(`tem um errado ai no meio, chefia`);

			}
		
		}

	})

	// Se houver algo diferente, então manter a variável correto como falso
	// se tudo passar pela verificação, alterar a varável correto para verdadeiro

	acertos == arrayOriginal.length? correto = true: correto = false;

	console.log(correto);
	
	if (endGame == false && etapaAtual <= etapaMax) {

		if (correto) {
			textoAcerto.innerText = "Você acertou! Fase concluída.";
			modalAcerto.style.display = 'block';
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
						var texto = document.getElementById('texto1');
						texto.innerHTML = etapaAtual.toString() + "/5";
						break;
					case 5:
						arrayEstrelas[0].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto1');
						texto.innerHTML = etapaAtual.toString() + "/5";
						break;
					case 6:
					case 7:
					case 8:
					case 9:
					case 10:
						var texto = document.getElementById('texto2');
						texto.innerHTML = etapaAtual.toString() + "/11";
						break;
					case 11:
						arrayEstrelas[1].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto2');
						texto.innerHTML = etapaAtual.toString() + "/11";
						break;
					case 12:
					case 13:	
					case 14:
					case 15:
					case 16:
						var texto = document.getElementById('texto3');
						texto.innerHTML = etapaAtual.toString() + "/17";
						break;
					case 17:
						arrayEstrelas[2].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto3');
						texto.innerHTML = etapaAtual.toString() + "/17";
						break;
					case 18:
					case 19:
					case 20:
					case 21:
					case 22:
						var texto = document.getElementById('texto4');
						texto.innerHTML = etapaAtual.toString() + "/23";
						break;
					case 23:
						arrayEstrelas[3].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto4');
						texto.innerHTML = etapaAtual.toString() + "/23";
						break;
					default:
						break;
				}
				modalAcerto.style.display = 'none'
				game();
				
				
			};
		} else{ 
			modalErro.style.display = 'block';
			textoErro.innerText = "Resposta errada... Tente novamente!";
		}

	} else {
		chuva()
		textoAcerto.innerHTML = "Você concluiu o jogo! Parabens!!";
		modalFim.style.display = 'block';
		btnReiniciar.onclick = function (event){
			stopChuva()
			etapaAtual = 0;
			resetEstrelas();
			game();
			endGame = false;
			modalFim.style.display = 'none';
		};
	}
}
/** FIM FUNCOES DO JOGO */


document.body.onload = game;
var botaoResultado = document.getElementById('botao-resultado');
botaoResultado.addEventListener('click', check); //lincoln: adicionado