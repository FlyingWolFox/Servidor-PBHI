/** CONSTANTES DO SCRIPT **/

// IDs dos containers
const divSequencia = 'container-nucleo';
const divOpcoes = 'container-formas';
const divCaixa = 'container-sequencia';
const textNumeroFase = 'textbox-numero-fase';
const divEstrelas = 'container-estrelas';

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
/** FIM CONSTANTES */

/** VARIAVEIS GLOBAIS COMPARTILHADAS ENTRE AS FUNCOES */

var arrayCaixa = []; //Elementos colocados na caixa de resposta
var arrayNucleo = []; //Array para guardar o nucleo
var arraySequencia = []; //Array para guardar a sequecia
var arrayOpcoes = []; //Array contendo todos os elementos gerados nas opcoes
var tamNucleo; //Quantos elementos o nucleo possui
var nSlots; //quantas vezes o nucleo se repete na resposta
var etapaAtual = 0;
var estrela = 0; //nível de estrelas do jogador 
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');
var ano = localStorage.getItem('ano');
var etapaMax = 40;
console.log('esse eh o ano:' + ano);

/** FIM VARIAVEIS */

/** FUNCOES DE APOIO */
function getFasesPorAno(){
	switch(ano){
		case "Primeiro ano":
			etapaMax = 10;
			break;
		case "Segundo ano":
			etapaMax = 12;
			break;
		case "Terceiro ano":
			etapaMax = 15;
			break;
		case "Quarto ano":
			etapaMax = 18;
			break;
		case "Quinto ano":
			etapaMax = 30;
			break;
		case "Sexto ano":
			etapaMax = 30;
			break;			
	}
	console.log("esse eh o numero maximo de fases desse ano: " + etapaMax);
}
//getFasesPorAno();

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
function getImgScr(forma, cor, tamanho, contorno) {
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

function getImgAlt(img) {
	var alt = '';

	switch (parseInt(img.getAttribute('tipo'))) {
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

	switch (parseInt(img.getAttribute('cor'))) {
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

	switch (parseInt(img.getAttribute('tam'))) {
		case tamanhoEnum.grande:
			alt += ', grande';
			break;
		case tamanhoEnum.pequeno:
			alt += ', pequeno';
			break;
	}

	switch (parseInt(img.getAttribute('cont'))) {
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

function novaImgBlocoLogicoComRestricoes(arrayPecasExistentes, maxCores, maxFormas, maxTamanhos, maxContornos) {
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
		//preencher caracteristicas usadas
		console.log('verificar caracteristicas usadas');
		for (i = 0; i < arrayPecasExistentes.length; i++) {
			if (arrayPecasExistentes[i] == null)
				continue;
			coresUsadas += corUsada[arrayPecasExistentes[i].getAttribute('cor')] == 1 ? 0 : 1;
			corUsada[arrayPecasExistentes[i].getAttribute('cor')] = 1;
			formasUsadas += formaUsada[arrayPecasExistentes[i].getAttribute('tipo')] == 1 ? 0 : 1;
			formaUsada[arrayPecasExistentes[i].getAttribute('tipo')] = 1;
			tamanhosUsados += tamanhoUsado[arrayPecasExistentes[i].getAttribute('tam')] == 1 ? 0 : 1;
			tamanhoUsado[arrayPecasExistentes[i].getAttribute('tam')] = 1;
			contornosUsados += contornoUsado[arrayPecasExistentes[i].getAttribute('cont')] == 1 ? 0 : 1;
			contornoUsado[arrayPecasExistentes[i].getAttribute('cont')] = 1;
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

	arq = getImgScr(tipo, cor, tam, cont);
	novaImg.setAttribute('src', arq);
	novaImg.setAttribute('cor', cor);
	novaImg.setAttribute('tipo', tipo);
	novaImg.setAttribute('tam', tam);
	novaImg.setAttribute('cont', cont);
	novaImg.setAttribute('alt', getImgAlt(novaImg));
	novaImg.setAttribute('title', novaImg.getAttribute('alt'));
	novaImg.classList.add('game-img');
	tam == 1 ? novaImg.classList.add('pequeno') : novaImg.classList.add('grande');


	console.log('novaimg: tipo=' + tipo + ', cor=' + novaImg.getAttribute('cor') + ', tam=' + tam + ', contorno=' + cont + ', src=' + arq);

	return novaImg;
}

function checaOcorrencia(array, elemento){
	var count = 0;
	array.forEach((v) => (v === elemento && count++));
	return count;
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
	contImgsCorretas = 0;
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

var contImgsCorretas = 0;

function substituiImgs(nSequencia, etapaAtual, nSlots) {
	var divNuc = document.getElementById(divSequencia);
	var childNucleo = divNuc.children;
	var arraySlots = [];
	var imgSubstituida = [];
	var indices = [];
	divOps = document.getElementById(divOpcoes);
	for (var i = 0; i < nSlots; i++) {
		if(etapaAtual < 12){// desvio condicional pra separar os jogos, A2
			indices[i] = (arraySequencia.length - i) - 1;
			console.log("valor de nSlots:" + nSlots);
			imgSubstituida[i] = document.createElement('img');
			imgSubstituida[i] = arraySequencia[indices[i]]; //armazena a imagem substituida
			arraySlots[i] = document.createElement("div"); //cria um elemento div com propriedas de drop pra ficar no lugar da imagem substituida
			arraySlots[i].setAttribute('id', 'substituta' + i);
			arraySlots[i].classList.add("dropzone");
			arraySlots[i].classList.add("slot");
			arraySequencia[indices[i]] = arraySlots[i]; //adiciona o elemento div no lugar da imagem 
			childNucleo[indices[i]].replaceWith(arraySequencia[indices[i]]); // adiciona o slot na zona dquencia
			//console.log("a img substituida eh:" + imgSubstituida[i].getAttribute("alt"));
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
			imgSubstituida[i] = document.createElement('img');
			imgSubstituida[i] = arraySequencia[indices[i]]; //armazena a imagem substituida
			//imgSubstituida[i].setAttribute('src', arraySequencia[indices[i]].getAttribute('src'));
			arraySlots[i] = document.createElement("div"); //cria um elemento div com propriedas de drop pra ficar no lugar da imagem substituida
			arraySlots[i].setAttribute('id', 'substituta' + i);
			arraySlots[i].classList.add("dropzone");
			arraySlots[i].classList.add("slot");
			arraySequencia[indices[i]] = arraySlots[i]; //adiciona o elemento div no lugar da imagem 
			childNucleo[indices[i]].replaceWith(arraySequencia[indices[i]]); // adiciona o slot na zona dquencia
			//console.log("a img substituida eh:" + imgSubstituida[i].getAttribute("alt"));
			//divOps.appendChild(imgSubstituida[i]); // adiciona a imagem substituida nas opções do jogadore se
		}
	}
	
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
				if(!incluiElemento && difOcorrencias[i] > 0){
					arrayOpsAux[count].replaceWith(imgSubstituida[i]);
					console.log("eu substitui a img: " + arrayOpsAux[count].getAttribute('alt') + "pela img:" + imgSubstituida[i].getAttribute("alt"));
					difOcorrencias[i]--;
					continue;
				}
		}	

		}
	}
}	

function shuffle(array){
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
	var tamSeq = 0; //Tamanho da sequência do núcleo
	var tamOpcoes = 0; //quantidade de opções de resposta
	var coresDistintas = 0; //quantidade de cores distintas possiveis nas opcoes
	var formasDistintas = 0; //quantidade de formas distintas possiveis nas opcoes
	var tamanhosDistintos = 0; //quantidade de tamanhos distintas possiveis nas opcoes
	var contornosDistintos = 0; //quantidade de contornos distintas possiveis nas opcoes
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
			tamSeq = 8;
			tamOpcoes = 2; 
			coresDistintas = 2;
			formasDistintas = 2;
			tamanhosDistintos = 2;
			contornosDistintos = 1;
			break;
		case 1:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2;
			coresDistintas = 2;
			formasDistintas = 1;
			tamanhosDistintos = 2;
			contornosDistintos = 1;
			break;
		case 2:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 3;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 1;
			break;
		case 3:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 1;
			break;
		case 4:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2;
			coresDistintas = 1;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 5:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 3;
			coresDistintas = 1;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 6:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 2;
			contornosDistintos = 1;
			break;
		case 7:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 1;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 8:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 9:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 10:	
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 1;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;

		case 11:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 5;
			coresDistintas = 1;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 12:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2; 
			coresDistintas = 2;
			formasDistintas = 2;
			tamanhosDistintos = 2;
			contornosDistintos = 1;
			break;
		case 13:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2;
			coresDistintas = 2;
			formasDistintas = 1;
			tamanhosDistintos = 2;
			contornosDistintos = 1;
			break;
		case 14:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 3;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 1;
			break;
		case 15:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 1;
			break;
		case 16:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 2;
			coresDistintas = 1;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 17:
			nSlots = 1;
			tamNucleo = 1;
			tamSeq = 8;
			tamOpcoes = 3;
			coresDistintas = 1;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 18:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 2;
			contornosDistintos = 1;
			break;
		case 19:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 1;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 20:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 21:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
		case 22:	
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 4;
			coresDistintas = 1;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
			break;
	
		case 23:
			nSlots = 2;
			tamNucleo = 2;
			tamSeq = 8;
			tamOpcoes = 5;
			coresDistintas = 1;
			formasDistintas = 3;
			tamanhosDistintos = 1;
			contornosDistintos = 2;						
			endGame = true;	
			break;
		
		default:
			alert("Fim do Jogo! Parabens!");
			break;
	}

	//montar nucleo
	console.log("montar nucleo");
	for (i = 0; i < tamNucleo; i++) {
		arrayNucleo[i] = novaImgBlocoLogicoComRestricoes(arrayNucleo, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);

	}

	//adicionar sequencia no div
	var divNucleo = document.getElementById(divSequencia); //div responsável pela sequencia do nucleo
	if (divNucleo == null) {
		alert("divnucleo null");
	}
	var seqAtual = 0;
	while (seqAtual < tamSeq) {
		for (i = 0; i < tamNucleo && seqAtual < tamSeq; i++) {
			arraySequencia[seqAtual] = document.createElement("img");
			arraySequencia[seqAtual].setAttribute('id', 'seq' + (seqAtual + 1));
			arraySequencia[seqAtual].setAttribute('src', arrayNucleo[i].getAttribute("src"));
			arraySequencia[seqAtual].setAttribute('alt', arrayNucleo[i].getAttribute("alt"));
			arraySequencia[seqAtual].setAttribute('title', arrayNucleo[i].getAttribute("title"));
			arraySequencia[seqAtual].classList.add('game-img');
			arrayNucleo[i].getAttribute("tam") == 1 ? arraySequencia[seqAtual].classList.add('pequeno') : arraySequencia[seqAtual].classList.add('grande');
			divNucleo.appendChild(arraySequencia[seqAtual]);
			arrayOriginal.push(arraySequencia[seqAtual])
			console.log('Adicionado seq #' + seqAtual + ': id=' + arraySequencia[seqAtual].getAttribute("id") + ', src=' + arraySequencia[seqAtual].getAttribute("src"));
			seqAtual++;
		}
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
		arrayOpcoes[indice[i]].setAttribute('cor', arrayNucleo[i].getAttribute("cor")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('tam', arrayNucleo[i].getAttribute("tam")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('tipo', arrayNucleo[i].getAttribute("tipo")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('cont', arrayNucleo[i].getAttribute("cont")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('alt', arrayNucleo[i].getAttribute("alt")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('title', arrayNucleo[i].getAttribute("title")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].classList.add('game-img');
		arrayNucleo[i].getAttribute("tam") == 1 ?arrayOpcoes[indice[i]].classList.add('pequeno') : arrayOpcoes[indice[i]].classList.add('grande');
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
				var novaOpcao = novaImgBlocoLogicoComRestricoes(arrayOpcoes, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
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
		botaoOk.innerHTML = "Reiniciar";
		modalFim.style.display = 'block';
		btnReiniciar.onclick = function (event){
			stopChuva()
			etapaAtual = 0;
			resetEstrelas();
			endGame = false;
			game();
			modalFim.style.display = 'none';
		};
	}
}
/** FIM FUNCOES DO JOGO */


document.body.onload = game;
var botaoResultado = document.getElementById('botao-resultado');
botaoResultado.addEventListener('click', check); 
//lincoln: adicionado