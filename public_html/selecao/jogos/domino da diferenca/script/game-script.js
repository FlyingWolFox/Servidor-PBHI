/** CONSTANTES DO SCRIPT **/

// IDs dos containers
const divSequencia = 'container_sequencia';
const divOpcoes = 'container_formas';
const divCaixa = 'container_sequencia'; //container-resposta
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
var etapaAtual = 0;
var estrela = 0; //nível de estrelas do jogador 
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');
var erros = [];
var ano = localStorage.getItem('ano');
var etapaMax = 30;
/** FIM VARIAVEIS */

/** FUNCOES DE APOIO */

function getFasesPorAno(){
	switch(ano){
		case "Primeiro ano":
			etapaMax = 8;
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

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** FIM FUNCOES DE APOIO */

/** FUNCOES DO JOGO */
function getImgScr(forma, cor, tamanho, contorno) {
	var src = '../img/fig-sem-rosto/';

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

function getRawSrc(forma, cor, tamanho, contorno) {
	var src = '';
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

	return src;
}



function getImgAlt(img){
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

function novaImgBlocoLogico(arrayPecasExistentes) {
	var novaImg = document.createElement("img");
	var i, tipo, cor, tam, cont, arq, opcaoVariar, tipoTemp, corTemp, tamTemp, contTemp, num;
	if (arrayPecasExistentes.length != 0) {
		for (i = 0; i < arrayPecasExistentes.length; i++) {
			if (arrayPecasExistentes[i] == null)
				continue;
			var ehNovo = 0;
			while (!ehNovo) {
				tipo = parseInt(arrayPecasExistentes.at(-1).getAttribute('tipo')); //Pega o atributo 'tipo' do último elemento dentro do array
				cor = parseInt(arrayPecasExistentes.at(-1).getAttribute('cor'));
				tam = parseInt(arrayPecasExistentes.at(-1).getAttribute('tam'));
				cont = parseInt(arrayPecasExistentes.at(-1).getAttribute('cont'));
				
				opcaoVariar = getRandomIntInclusive(0, 3); //Variável que vai escolher qual característica variar...
				//0: Formas, 1: cores, 2: tamanho, 3: borda
				switch (opcaoVariar) {
					case 0:
						num = getRandomIntInclusive(0, 3); //Escolhe uma forma, se a forma já existe, ele não avança pro if
						if (tipo != num) {
							ehNovo = 1;
							for (var j = 0; j < arrayPecasExistentes.length; j++) { //Percorre o array de peças tentando encontrar se a combinação já existe
								tipoTemp = arrayPecasExistentes[j].getAttribute('tipo');
								corTemp = arrayPecasExistentes[j].getAttribute('cor');
								tamTemp = arrayPecasExistentes[j].getAttribute('tam');
								contTemp = arrayPecasExistentes[j].getAttribute('cont');
								if (num == tipoTemp && cor == corTemp && tam == tamTemp && cont == contTemp) {
									ehNovo = 0; //Se cair aqui, é porque a combinação já existe e volta pro começo do while e sorteia uma nova forma
									break;
								} else if (j == arrayPecasExistentes.length - 1) { //Caso tenha chagado ao final da lista e não encontrou nenhumaa combnação idêntica
									tipo = num;
                                }
							}
						}
						break;
					case 1:
						num = getRandomIntInclusive(0, 2); //Escolhe uma cor, se a cor já existe, ele não avança pro if
						if (cor != num) {
							ehNovo = 1;
							for (var j = 0; j < arrayPecasExistentes.length; j++) { //Percorre o array de peças tentando encontrar se a combinação já existe
								tipoTemp = arrayPecasExistentes[j].getAttribute('tipo');
								corTemp = arrayPecasExistentes[j].getAttribute('cor');
								tamTemp = arrayPecasExistentes[j].getAttribute('tam');
								contTemp = arrayPecasExistentes[j].getAttribute('cont');
								if (tipo == tipoTemp && num == corTemp && tam == tamTemp && cont == contTemp) {
									ehNovo = 0; //Se cair aqui, é porque a combinação já existe e volta pro começo do while e sorteia uma nova forma
									break;
								} else if (j == arrayPecasExistentes.length - 1) {
									cor = num;
                                }
							}
						}
						break;
					case 2:
						num = (tam == 1 ? 0 : 1); //Escolhe um tam, se o tam já existe, ele não avança pro if
						if (tam != num) {
							ehNovo = 1;
							for (var j = 0; j < arrayPecasExistentes.length; j++) { //Percorre o array de peças tentando encontrar se a combinação já existe
								tipoTemp = arrayPecasExistentes[j].getAttribute('tipo');
								corTemp = arrayPecasExistentes[j].getAttribute('cor');
								tamTemp = arrayPecasExistentes[j].getAttribute('tam');
								contTemp = arrayPecasExistentes[j].getAttribute('cont');
								if (tipo == tipoTemp && cor == corTemp && num == tamTemp && cont == contTemp) {
									ehNovo = 0; //Se cair aqui, é porque a combinação já existe e volta pro começo do while e sorteia uma nova forma
									break;
								} else if (j == arrayPecasExistentes.length - 1) {
									tam = num;
                                }
							}
						}
						break;
					case 3:
						num = (cont == 1 ? 0 : 1); //Escolhe um cont, se o cont já existe, ele não avança pro if
						if (cont != num) {
							ehNovo = 1;
							for (var j = 0; j < arrayPecasExistentes.length; j++) { //Percorre o array de peças tentando encontrar se a combinação já existe
								tipoTemp = arrayPecasExistentes[j].getAttribute('tipo');
								corTemp = arrayPecasExistentes[j].getAttribute('cor');
								tamTemp = arrayPecasExistentes[j].getAttribute('tam');
								contTemp = arrayPecasExistentes[j].getAttribute('cont');
								if (tipo == tipoTemp && cor == corTemp && tam == tamTemp && num == contTemp) {
									ehNovo = 0; //Se cair aqui, é porque a combinação já existe e volta pro começo do while e sorteia uma nova forma
									break;
								} else if (j == arrayPecasExistentes.length - 1) {
									cont = num;
                                }
							}
						}
						break;
				}
            }
        }
	} else{
		if(etapaAtual < 4){ 
			console.log('array de imgs estava vazio');
			cor = 0;
			tipo = 3;
			tam = 1;
			cont = 1;
		}else{
			//array vazio
			console.log('array de imgs estava vazio');
			cor = getRandomIntInclusive(0, 2);
			tipo = getRandomIntInclusive(0, 3);
			tam = getRandomIntInclusive(0, 1);
			cont = getRandomIntInclusive(0, 1);
		}
		
	}
	var respostaSrc = getRawSrc(tipo, cor, tam, cont);
	arq = getImgScr(tipo, cor, tam, cont);
	novaImg.setAttribute('src', arq);
	novaImg.setAttribute('resposta', respostaSrc);
	novaImg.setAttribute('cor', cor);
	novaImg.setAttribute('tipo', tipo);
	novaImg.setAttribute('tam', tam);
	novaImg.setAttribute('cont', cont);
	novaImg.setAttribute('alt', getImgAlt(novaImg));
	novaImg.setAttribute('title', novaImg.getAttribute('alt'));
	novaImg.classList.add('game-img');
	tam == 1 ? novaImg.classList.add('pequeno') : novaImg.classList.add('grande');

	console.log('novaimg: tipo=' + tipo + ', cor=' + novaImg.getAttribute('cor') + ', tam=' + tam + ', contorno=' + cont + ', src=' + novaImg.getAttribute('resposta') + ' , alt= ' + novaImg.getAttribute('alt'));

	return novaImg;

}

	// Função para randomizar array
function embaralhaArray(array) {
		// Loop em todos os elementos
		for (let i = array.length - 1; i > 0; i--) {
			// Escolhendo elemento aleatório
			const j = Math.floor(Math.random() * (i + 1));
			// Reposicionando elemento
			[array[i], array[j]] = [array[j], array[i]];
		}
		// Retornando array com aleatoriedade
		return array;
	}


function reset() {
	removeChildElementsByTag(divSequencia, 'img');
	removeChildElementsByTag(divOpcoes, 'img');
	removeChildElementsByTag(divCaixa, 'img');

	arrayCaixa = [];
	arrayNucleo = [];
	arraySequencia = [];
	arrayOpcoes = [];
	tamNucleo = 0;
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
	let timeOut = []
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
	return timeOut
}

function stopChuva(){
    var filhos = document.querySelector('body').querySelectorAll('.gota')
    filhos.forEach(filho => {
        filho.parentElement.removeChild(filho)
    })
}

endGame = false;
var tamOpcoes = 0; //quantidade de opções de resposta

function game() {
	reset();
	//const queryString = window.location.search; //guarda tudo apos a ? (incluindo ela)
	//const urlParams = new URLSearchParams(queryString); //processa as variaveis, separando-as
	//const etapa = 0;  //urlParams.get('etapa');     //pega o valor passado na variavel etapa

	//iniciar variaveis de controle
	var tamSeq = 0; //Tamanho da sequência do núcleo
	var tamOpcoes = 0; //quantidade de opções de resposta
	var coresDistintas = 0; //quantidade de cores distintas possiveis nas opcoes
	var formasDistintas = 0; //quantidade de formas distintas possiveis nas opcoes
	var tamanhosDistintos = 0; //quantidade de tamanhos distintas possiveis nas opcoes
	var contornosDistintos = 0; //quantidade de contornos distintas possiveis nas opcoes
	var i, j, escolhido, achouIgual;

	var fonte = ''; //source de cada imagem	
	var cor, tipo, tam, cont, arq; //Atributos de cada imagem (cor, tipo, tamanho e contorno)
	
	var textNumeroFaseDom = document.getElementById(textNumeroFase);
	textNumeroFaseDom.innerHTML = (etapaAtual + 1);


	//setar os valores das variaveis de controle de acordo com a etapa/fase
	switch (etapaAtual) {
		case 0:
			/*Padronizado*/
			//tamNucleo = 1;
      		//tamSeq = 7;
			tamOpcoes = 2;
      		//coresDistintas = 1;
      		//formasDistintas = 4;
      		//tamanhosDistintos = 1;
			//contornosDistintos = 1;
      		break;
      	case 1:     		
      		//tamNucleo = 1;
			//tamSeq = 8;
      		tamOpcoes = 3;
      		//coresDistintas = 2;
      		//formasDistintas = 3;
      		//tamanhosDistintos = 2;
      		//contornosDistintos = 1;
      		break;
      	case 2:     		
      		//tamNucleo = 1;
			//tamSeq = 9;
      		tamOpcoes = 4;
      		//coresDistintas = 4;
      		//formasDistintas = 3;
      		//tamanhosDistintos = 2;
      		//contornosDistintos = 2;
			break;
		case 3:     		
      		//tamNucleo = 2;
			//tamSeq = 8;
      		tamOpcoes = 4;
      		//coresDistintas = 1;
      		//formasDistintas = 3;
      		//tamanhosDistintos = 2;
      		//contornosDistintos = 1;
			break;   
		case 4: 		
      		//tamNucleo = 2;
			//tamSeq = 8;
      		tamOpcoes = 2;
      		//coresDistintas = 2;
      		//formasDistintas = 3;
      		//tamanhosDistintos = 1;
      		//contornosDistintos = 2;
			break;
		case 5: 		
      		//tamNucleo = 2;
			//tamSeq = 8;
      		tamOpcoes = 3;
      		//coresDistintas = 3;
      		//formasDistintas = 3;
      		//tamanhosDistintos = 1;
      		//contornosDistintos = 2;
			break;
		case 6: 	
			//tamNucleo = 2;
			//tamSeq = 9;
      		tamOpcoes = 4;
      		//coresDistintas = 3;
      		//formasDistintas = 4;
      		//tamanhosDistintos = 1;
      		//contornosDistintos = 1;	
			break;
		case 7: 				
			//tamNucleo = 3;
			//tamSeq = 9;
      		tamOpcoes = 5;
      		//coresDistintas = 1;
      		//formasDistintas = 3;
      		//tamanhosDistintos = 2;
      		//contornosDistintos = 1;
			break;
		case 8: 		
			//tamNucleo = 3;
		  	//tamSeq = 10;
			tamOpcoes = 6;
			//coresDistintas = 2;
			//formasDistintas = 2;
			//tamanhosDistintos = 1;
			//contornosDistintos = 2;
		  	break;
		case 9: 		
			//tamNucleo = 3;
			//tamSeq = 12;
			tamOpcoes = 7;
			//coresDistintas = 2;
			//formasDistintas = 2;
			//tamanhosDistintos = 2;
			//contornosDistintos = 2;
			break;
		case 10: 		
			//tamNucleo = 3;
			//tamSeq = 10;
			tamOpcoes = 7;
			//coresDistintas = 3;
			//formasDistintas = 2;
			//tamanhosDistintos = 1;
			//contornosDistintos = 2;
			break
		case 11: 		
			//tamNucleo = 3;
			//tamSeq = 10;
			tamOpcoes = 8;
			/*coresDistintas = 3;
			formasDistintas = 3;
			tamanhosDistintos = 2;
			contornosDistintos = 2;*/
			break;

		case 12: 		
			/*tamNucleo = 3;
			tamSeq = 10;*/
			tamOpcoes = 6;
			/*coresDistintas = 3;
			formasDistintas = 4;
			tamanhosDistintos = 1;
			contornosDistintos = 2;*/
			break;
		case 13: 		
			/*tamNucleo = 3;
			tamSeq = 12;*/
			tamOpcoes = 6;
			/*coresDistintas = 3;
			formasDistintas = 4;
			tamanhosDistintos = 2;
			contornosDistintos = 2;*/
			break;
		case 14: 		
			/*tamNucleo = 4;
			tamSeq = 12;*/
			tamOpcoes = 6;
			/*coresDistintas = 2;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;*/
			break;			  
		case 15: 		
			/*tamNucleo = 4;
			tamSeq = 12;*/
			tamOpcoes = 6;
			/*coresDistintas = 3;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;*/
			endGame = true;
			break;	
		/*case 16: 		
			tamNucleo = 4;
			tamSeq = 12;
			tamOpcoes = 8;
			coresDistintas = 3;
			formasDistintas = 4;
			tamanhosDistintos = 2;
			contornosDistintos = 2;
			endGame= true;
			break;*/			
    default:
		// alert("Fim do Jogo! Parabens!");
		break;
    }

	//montar nucleo
	console.log("montar nucleo");
	/*for (i = 0; i < tamNucleo; i++) {
		arrayNucleo[i] = novaImgBlocoLogicoComRestricoes(arrayNucleo, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
	}*/

	for (i = 0; i < tamOpcoes; i++) {
		arrayOpcoes[i] = novaImgBlocoLogico(arrayOpcoes);
	}
	var primeiraPeca = arrayOpcoes[0];
	embaralhaArray(arrayOpcoes);
	
	

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
			arrayNucleo[i].getAttribute('tam') == 1 ? arraySequencia[seqAtual].classList.add('pequeno') : arraySequencia[seqAtual].classList.add('grande');
			divNucleo.appendChild(arraySequencia[seqAtual]);
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
				if (indice[i] == indice[j]){
					indice[i] = -1;
					break; //ja tinha um indice desse 
				}
			}
			if (indice[i] != -1)
				break; //indice escolhido ok
		}

		console.log('nucleo[' + i + '] ficara no indice: ' + indice[i]);

		arrayOpcoes[indice[i]] = document.createElement("img");
		arrayOpcoes[indice[i]].setAttribute('src', arrayNucleo[i].getAttribute("src")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('cor', arrayNucleo[i].getAttribute("cor")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('tam', arrayNucleo[i].getAttribute("tam")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('tipo', arrayNucleo[i].getAttribute("tipo")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('cont', arrayNucleo[i].getAttribute("cont")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('alt', arrayNucleo[i].getAttribute("alt")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].setAttribute('title', arrayNucleo[i].getAttribute("title")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
		arrayOpcoes[indice[i]].classList.add('game-img');
		arrayNucleo[i].getAttribute('tam') == 1 ? arrayOpcoes[indice[i]].classList.add('pequeno') : arrayOpcoes[indice[i]].classList.add('grande');

	}

	//escolher demais opcoes de escolha
	console.log('escolher opcoes');
	var arrayCaixa = document.getElementById(divCaixa)
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
		// arrayOpcoes[i].setAttribute('draggable','true');
		// arrayOpcoes[i].setAttribute('droppable','false');
		// arrayOpcoes[i].setAttribute('ondragstart', 'drag(event)');
		divOps.appendChild(arrayOpcoes[i]);
		if(etapaAtual  < 4){
			arrayCaixa.appendChild(primeiraPeca);
		}
		
		console.log('Adicionado forma/opcao parte2 #' + i + ': id=' + arrayOpcoes[i].getAttribute("id") + ', src=' + arrayOpcoes[i].getAttribute("src"));
	}
}

function compare(wordOne, wordTwo){
	var count = 0;
	
	 for(var i = 0; i < wordOne.length; i++){
		 if(wordOne[i] === wordTwo[i]){
			 count++;
		 }
	 }
	 
	 console.log("o numero de semelhanças entre as imagens é: " + count);
	 return count;
 }

function resetDiv(){
	var divbox = document.getElementById(divCaixa);              
	
	var divOpsAux = divbox.children;
	var arrayOpsAux = Array.from(divOpsAux);

	for(var i = 0; i < arrayOpsAux.length; i++){
		arrayOpsAux[i].classList.remove('escolhida');
	}

}

var arrayDropbox = document.getElementById(divCaixa).getElementsByTagName('img');
function mudaOpacidade(){
	/*for(var i = 0; i < arrayDropbox.length; i++){
		arrayDropbox[i].style.opacity = 1;
	}*/
	var prop = 'animation-delay';
	if (erros.length != 0) { //Percorre o array de erros e altera a opacidadeda da peça de acordo com a posição salva dentro do array erros
		for(i = 0; i < erros.length; i++) {
			//document.getElementById(divOpcoes).classList.add('draggable-dropzone--occupied');
			arrayDropbox[0].style.opacity = 1; //Altera a opaciade da 1 peça, pois, é a partir da segunda peça que precisa apresentar opacidade diferente
			//arrayDropbox[erros[i]].classList.add('escolhida');
			//arrayDropbox[erros[i]].style.setProperty(prop, '0.5s');
			//resetDiv();
			//arrayDropbox[erros[i]].style.opacity = 0.5;
			//arrayDropbox[erros[i]].style.transition = "1s";
			//arrayDropbox[erros[i]].style.transform = 'scale(1.3)';
			//arrayDropbox[erros[i]].style.transform = translateNegativo;;
			//arrayDropbox[0].style.opacity = 1; //Altera a opaciade da 1 peça, pois, é a partir da segunda peça que precisa apresentar opacidade diferente
			setTimeout(function () {
				arrayDropbox[erros[0]].style.transition = "1s"; //Setando o tempo para que a animação ocorra mais flúida.
				arrayDropbox[erros[0]].style.opacity = 0.5;
				arrayDropbox[erros[0]].style.transform = 'scale(1.3)';
			}, 200);
			setTimeout(function () {
				//arrayDropbox[erros[0]].style.opacity = 1;
				arrayDropbox[erros[0]].style.transform = 'scale(1)';
				//arrayDropbox[erros[0]].style.opacity = 0.5;
			}, 700);
			setTimeout(function () {
				arrayDropbox[erros[0]].style.transition = "0s"; //Tira aquele efeito estranho da peça sendo arrastada.
				//document.getElementById(divOpcoes).classList.remove('draggable-dropzone--occupied');
			}, 1000);
			//arrayDropbox[erros[i]].style.transform = 'scale(1)';
			//arrayDropbox[erros[i]].style.transform = translateNegativo;
			break;
		}
	}
}

function check() { //Verifica se acertou os elementos
	var arrayDropbox = document.getElementById(divCaixa).getElementsByTagName('img');
	var botaoOk = document.getElementById('botao-proximo');
	var i, j;
	var correto = 1;

	var textoAcerto = document.getElementById('resultado-jogo');
    var textoErro = document.getElementById('resultadoNegativo-jogo')

    var modalAcerto = document.getElementById("modalAcerto");
    var modalErro = document.getElementById('modalErro');

	var modalFim = document.getElementById('modalFim')
	var btnReiniciar = document.getElementById('botao-restart')

	if (arrayDropbox.length != arrayOpcoes.length) {
		correto = 0;
		console.log('o array nao foi carregado ou esta vazio');
	} else {
		erros.splice(0, erros.length); //Reseta array de erros
		var index = 0; //Índice para acomodar os erros
		for( i = 0; i < arrayOpcoes.length - 1; i++){
			if (compare(arrayDropbox[i].getAttribute('resposta'), arrayDropbox[i + 1].getAttribute('resposta')) < 3) {
				arrayDropbox[0].style.opacity = 1; //Altera a opaciade da 1 peça, pois, é a partir da segunda peça que precisa apresentar opacidade diferente
				//arrayDropbox[i + 1].style.opacity = 0.5;
				erros[index] = i + 1; //Salva no array de erros aonde se encontra o erro
				index++;
				correto = 0;
				//break;
			} else if (compare(arrayDropbox[i].getAttribute('resposta'), arrayDropbox[i + 1].getAttribute('resposta')) == 3) {
				arrayDropbox[0].style.opacity = 1; //Altera a opaciade da 1 peça, pois, é a partir da segunda peça que precisa apresentar opacidade diferente
				arrayDropbox[i + 1].style.opacity = 1;
            }
		}
	}				
	if(endGame == false && etapaAtual <= etapaMax) {
		if (correto) {
			textoAcerto.innerHTML = "Você acertou! Fase concluída.";
			modalAcerto.style.display = 'block';
			botaoOk.innerHTML = "Próxima";
			botaoOk.onclick = function (event){
				etapaAtual++;
				estrela++;
				switch(estrela) {
					case 0:
					case 1:
					case 2:
					case 3:
						var texto = document.getElementById('texto1');
						texto.innerHTML = etapaAtual.toString() + "/4";
						break;
					case 4:
						arrayEstrelas[0].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto1');
						texto.innerHTML = etapaAtual.toString() + "/4";
						break;
					case 5:
					case 6:
					case 7:
						var texto = document.getElementById('texto2');
						texto.innerHTML = etapaAtual.toString() + "/8";
						break;
					case 8:
						arrayEstrelas[1].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto2');
						texto.innerHTML = etapaAtual.toString() + "/8";
						break;
					case 9:
					case 10:
					case 11:
						var texto = document.getElementById('texto3');
						texto.innerHTML = etapaAtual.toString() + "/12";
						break;
					case 12:
						arrayEstrelas[2].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto3');
						texto.innerHTML = etapaAtual.toString() + "/12";
						break;
					case 13:
					case 14:
					case 15:
						var texto = document.getElementById('texto4');
						texto.innerHTML = etapaAtual.toString() + "/16";
						break;
					case 16:
						arrayEstrelas[3].setAttribute('src', '../img/estrelas/star1.svg');
						var texto = document.getElementById('texto4');
						texto.innerHTML = etapaAtual.toString() + "/16";
						break;
					default:
						break;
				}
				game();
				modalAcerto.style.display = 'none';
			};
			
		} else {
			var botaoErrou = document.getElementById('botao-retorno');
			modalErro.style.display = 'block';
			textoErro.innerHTML = "Que pena, você colocou " + erros.length + " peça(s) errada(s). A primeira peça errada ficará marcada no Dominó. Tente novamente!";
			botaoErrou.innerHTML = "Continuar";
			botaoErrou.onclick = function(event){
				mudaOpacidade(); 			
				fecharModal('erro');
				console.log('fechei o modal e tal');
			};
		}

	} else {
		chuva()
		textoAcerto.innerHTML = "Você concluiu o jogo! Parabens!";
		modalFim.style.display = 'block';
		btnReiniciar.onclick = function (event){
			stopChuva()
			etapaAtual = 0;
			endGame = false;
			resetEstrelas();
			game();
			modalFim.style.display = 'none';
		};
	}
}
/** FIM FUNCOES DO JOGO */


document.body.onload = game;
var botaoResultado = document.getElementById('botao-resultado');
botaoResultado.addEventListener('click', check); //lincoln: adicionado
//botaoResultado.onclick = check(); //lincoln: removido