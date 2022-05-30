/** CONSTANTES DO SCRIPT */
const divSequencia = 'divSeq';
const divOpcoes = 'divOpcoes';
const divCaixa = 'dropBox';

const coresEnum = Object.freeze({"azul":0, "vermelho":1, "amarelo":2});
const formasEnum = Object.freeze({"triangulo":0, "quadrado":1, "retangulo":2, "circulo":3});
const tamanhoEnum = Object.freeze({"grande":0, "pequeno":1});
const contornoEnum = Object.freeze({"comContorno":0, "semContorno":1});
/** FIM CONSTANTES */

/** VARIAVEIS GLOBAIS COMPARTILHADAS ENTRE AS FUNCOES */
var arrayCaixa =[];    //Elementos colocados na caixa de resposta
var arrayNucleo = [];  //Array para guardar o nucleo
var arraySequencia = [];  //Array para guardar a sequecia
var arrayOpcoes = [];  //Array contendo todos os elementos gerados nas opcoes
var inversor = [];
var tamNucleo;         //Quantos elementos o nucleo possui
var etapaAtual;
/** FIM VARIAVEIS */

/** FUNCOES DE APOIO */
function allowDrop(event){
	if (event.target.getAttribute("droppable") == "false"){
		event.dataTransfer.dropEffect = "none"; // dropping is not allowed
		event.preventDefault();
	}else{
		event.dataTransfer.dropEffect = "all"; // drop it like it's hot
		event.preventDefault();
	}
	event.preventDefault();
}

function drag(event) {
	event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  var id = event.dataTransfer.getData("text");
  const draggableElement = document.getElementById(id);
  const dropzone = event.target;
  dropzone.appendChild(draggableElement);
  if (event.currentTarget.id == 'dropBox') {
      arrayCaixa.push(id);
  }
}

function noAllowDrop(ev) {
	ev.stopPropagation();
}  

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** FIM FUNCOES DE APOIO */

/** FUNCOES DO JOGO */
function getImgScr(forma, cor, tamanho, contorno){
	var src = 'img-novo/';
	
	switch(forma){
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

	switch(cor){
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

	switch(tamanho){
		case tamanhoEnum.grande:
			src += 'G';
			break;
		case tamanhoEnum.pequeno:
			src += 'P';
			break;
	}

	switch(contorno){
		case contornoEnum.comContorno:
			src += 'C';
			break;
		case contornoEnum.semContorno:
			src += 'S';
			break;
	}
	
	src += '.png';
	
	return src;
}

function removeChildElementsByTag(parent, tag){
	var parentDom = document.getElementById(parent);
	var elements = parentDom.getElementsByTagName(tag);
	var i;
	
	console.log('parent ' + parentDom.getAttribute('id') + ' tem ' + elements.length + ' childs.');
	for(i = elements.length - 1; i >= 0; i--){
		console.log('removendo ' + elements[i].getAttribute('id') + '/' + elements[i].parentNode.getAttribute('id'));
		//parentDom.removeChild(elements[i]);
		elements[i].remove();
	}

}

function novaImgBlocoLogicoComRestricoes(arrayPecasExistentes, maxCores, maxFormas, maxTamanhos, maxContornos){
	var novaImg = document.createElement("img"); 
	var i, cor, tipo, tam, cont, arq;
	var corUsada = [0, 0, 0], formaUsada = [0, 0, 0, 0], tamanhoUsado = [0, 0], contornoUsado = [0, 0];
	var coresUsadas = 0, formasUsadas = 0, tamanhosUsados = 0, contornosUsados = 0;
	
	if (arrayPecasExistentes.length != 0){
		//preencher caracteristicas usadas
		console.log('verificar caracteristicas usadas');
		for(i = 0; i < arrayPecasExistentes.length; i++){
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
		for(i = 0; i < corUsada.length; i++){
			console.log(i + ' = ' + corUsada[i]);
		}
		while(1){
			cor = getRandomIntInclusive(0, 2); 
			if (coresUsadas < maxCores && !corUsada[cor]){
				//se ainda nao escolheu todas as cores e eh  uma nova cor
				break;
			}
			if (coresUsadas >= maxCores && corUsada[cor]){
				//se ja escolheu todas as cores e eh cor ja usada
				break;
			}
		}
		//escolher forma
		console.log('escolher nova forma');
		while(1){
			tipo = getRandomIntInclusive(0, 3); 
			if (formasUsadas < maxFormas && !formaUsada[tipo]){
				break;
			}
			if (formasUsadas >= maxFormas && formaUsada[tipo]){
				break;
			}
		}
		//escolher tamanho
		console.log('escolher novo tamanho');
		while(1){
			tam = getRandomIntInclusive(0, 1); 
			console.log('tam escolhido = ' + tam + ' tamanhoUsado = ' + tamanhoUsado);
			if (tamanhosUsados < maxTamanhos && !tamanhoUsado[tam]){
				break;
			}
			if (tamanhosUsados >= maxTamanhos && tamanhoUsado[tam]){
				break;
			}
		}
		//escolher contorno
		console.log('escolher novo contorno');
		while(1){
			cont = getRandomIntInclusive(0, 1); 
			if (contornosUsados < maxContornos && !contornoUsado[cont]){
				break;
			}
			if (contornosUsados >= maxContornos && contornoUsado[cont]){
				break;
			}
		}
	}else{
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
  	  	  	  	
  	console.log('novaimg: tipo=' + tipo + ', cor=' + novaImg.getAttribute('cor') + ', tam=' + tam + ', contorno=' + cont + ', src=' + arq);

	return novaImg;
}

function reset(){
	removeChildElementsByTag(divSequencia, 'img');
	removeChildElementsByTag(divOpcoes, 'img');
	removeChildElementsByTag(divCaixa, 'img');

	arrayCaixa =[];    
	arrayNucleo = [];  
	arraySequencia = []; 
	arrayOpcoes = [];  
	tamNucleo = 0;      
}

function game(etapa){
	reset();  
  	//const queryString = window.location.search; //guarda tudo apos a ? (incluindo ela)
  	//const urlParams = new URLSearchParams(queryString); //processa as variaveis, separando-as
  	//const etapa = 0;  //urlParams.get('etapa');     //pega o valor passado na variavel etapa

  	//iniciar variaveis de controle
  	var tamSeq = 0;      //Tamanho da sequência do núcleo
  	var tamOpcoes = 0;   //quantidade de opções de resposta
  	var coresDistintas = 0; //quantidade de cores distintas possiveis nas opcoes
  	var formasDistintas = 0; //quantidade de formas distintas possiveis nas opcoes
  	var tamanhosDistintos = 0; //quantidade de tamanhos distintas possiveis nas opcoes
  	var contornosDistintos = 0; //quantidade de contornos distintas possiveis nas opcoes
  	var i, j, escolhido, achouIgual;

  	var fonte = '';              //source de cada imagem	
  	var cor, tipo, tam, cont, arq;  //Atributos de cada imagem (cor, tipo, tamanho e contorno)


	//setar os valores das variaveis de controle de acordo com a etapa/fase
	etapaAtual = etapa;
  	switch (etapa){
    	case 0:
      		/*Padronizado*/
      		tamNucleo = 1;
      		tamSeq = 7;
      		tamOpcoes = 3;
      		coresDistintas = 1;
      		formasDistintas = 3;
      		tamanhosDistintos = 1;
      		contornosDistintos = 1;
      		break;
      	case 1:     		
      		tamNucleo = 1;
			tamSeq = 7;
      		tamOpcoes = 4;
      		coresDistintas = 1;
      		formasDistintas = 4;
      		tamanhosDistintos = 2;
      		contornosDistintos = 1;
      		break;
      	case 2:     		
      		tamNucleo = 1;
			tamSeq = 7;
      		tamOpcoes = 3;
      		coresDistintas = 3;
      		formasDistintas = 1;
      		tamanhosDistintos = 1;
      		contornosDistintos = 1;
			break;
		case 3:     		
      		tamNucleo = 2;
			tamSeq = 8;
      		tamOpcoes = 4;
      		coresDistintas = 1;
      		formasDistintas = 4;
      		tamanhosDistintos = 1;
      		contornosDistintos = 1;
			break;   
		case 4: 		
      		tamNucleo = 2;
			tamSeq = 8;
      		tamOpcoes = 5;
      		coresDistintas = 1;
      		formasDistintas = 3;
      		tamanhosDistintos = 1;
      		contornosDistintos = 2;
			break;
		case 5: 		
      		tamNucleo = 2;
			tamSeq = 8;
      		tamOpcoes = 5;
      		coresDistintas = 2;
      		formasDistintas = 2;
      		tamanhosDistintos = 1;
      		contornosDistintos = 2;
			break;
		case 6: 		
      		tamNucleo = 3;
			tamSeq = 9;
      		tamOpcoes = 4;
      		coresDistintas = 1;
      		formasDistintas = 3;
      		tamanhosDistintos = 2;
      		contornosDistintos = 1;
			break;
		case 7: 		
      		tamNucleo = 2;
			tamSeq = 9;
      		tamOpcoes = 5;
      		coresDistintas = 3;
      		formasDistintas = 3;
      		tamanhosDistintos = 1;
      		contornosDistintos = 1;
			break;
		case 8: 		
			tamNucleo = 2;
		  	tamSeq = 10;
			tamOpcoes = 6;
			coresDistintas = 2;
			formasDistintas = 2;
			tamanhosDistintos = 1;
			contornosDistintos = 2;
		  	break;
      	default:
			alert("Fim do Jogo! Parabens!");
			break;
    }

	//montar nucleo
	console.log("montar nucleo");
	for(i = 0; i < tamNucleo; i++){
		arrayNucleo[i] = novaImgBlocoLogicoComRestricoes(arrayNucleo, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
	}
	
	//adicionar sequencia no div
	var divNucleo = document.getElementById(divSequencia);  //div responsável pela sequencia do nucleo
	if (divNucleo == null){
		alert("divnucleo null");
	}
	var seqAtual = 0;
	while(seqAtual < tamSeq){
		for(i = 0; i < tamNucleo && seqAtual < tamSeq; i++){
			arraySequencia[seqAtual] = document.createElement("img");
			arraySequencia[seqAtual].setAttribute('id', 'seq' + (seqAtual+1));
			arraySequencia[seqAtual].setAttribute('src', arrayNucleo[i].getAttribute("src"));
	        divNucleo.appendChild(arraySequencia[seqAtual]);
    	    console.log('Adicionado seq #' + seqAtual + ': id=' + arraySequencia[seqAtual].getAttribute("id") + ', src=' + arraySequencia[seqAtual].getAttribute("src") );
	        seqAtual++;
		}
	}
      
    /* Atribui as imagens do núcleo em posicoes aleatorias do array */
	var divOps = document.getElementById(divOpcoes);  
	var indice = [];
	
	//escolher indices 
    for(i = 0; i < tamNucleo; i++){
		//loop infinito ate que as posicoes sejam distintas
    	while(1){
	        indice[i] = getRandomIntInclusive(0, tamOpcoes-1)//i;
	        for(j = 0; j < i; j ++){
	        	if (indice[i] == indice[j])
	        		continue; //ja tinha um indice desse 
	        }
    		break;
    	}
		
		console.log('nucleo['+i+'] ficara no indice: ' + indice[i]);

      	arrayOpcoes[indice[i]] = document.createElement("img");
      	arrayOpcoes[indice[i]].setAttribute('src', arrayNucleo[i].getAttribute("src")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
      	arrayOpcoes[indice[i]].setAttribute('cor', arrayNucleo[i].getAttribute("cor")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
      	arrayOpcoes[indice[i]].setAttribute('tam', arrayNucleo[i].getAttribute("tam")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
      	arrayOpcoes[indice[i]].setAttribute('tipo', arrayNucleo[i].getAttribute("tipo")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
      	arrayOpcoes[indice[i]].setAttribute('cont', arrayNucleo[i].getAttribute("cont")); //lincoln: nao precisa ter ID ja que sao elas q sao arrastadas?
    }
    
    //escolher demais opcoes de escolha
	console.log('escolher opcoes');
	for(i=0; i<tamOpcoes; i++){            //Set imagens como opcoes, sendo uma delas o nucleo (arrayFigura[indice])
		if(arrayOpcoes[i] == null){
          	/*cria um elemento imagem e coloca a source*/
          	var ehNovo = 0;
          	while(!ehNovo){
          		ehNovo = 1;
  				var novaOpcao = novaImgBlocoLogicoComRestricoes(arrayOpcoes, coresDistintas, formasDistintas, tamanhosDistintos, contornosDistintos);
  				for(j = 0; j < tamOpcoes; j++){
  					if (arrayOpcoes[j] != null && novaOpcao.getAttribute('src') == arrayOpcoes[j].getAttribute('src')){
  						ehNovo = 0;
  						break;
  					}
  				}
  			}
  			arrayOpcoes[i] = novaOpcao;
          	console.log('Adicionado forma/opcao #' + i + ': src=' + arrayOpcoes[i].getAttribute("src"));
        }

        arrayOpcoes[i].setAttribute('id', 'opcao' + (i+1)); //lincoln: diferenciando ID
        arrayOpcoes[i].setAttribute('draggable','true');
        arrayOpcoes[i].setAttribute('droppable','false');
        arrayOpcoes[i].setAttribute('ondragstart', 'drag(event)');
        divOps.appendChild(arrayOpcoes[i]); 
        console.log('Adicionado forma/opcao parte2 #' + i + ': id=' + arrayOpcoes[i].getAttribute("id") + ', src=' + arrayOpcoes[i].getAttribute("src") );
    }
}

function check(){          //Verifica se acertou os elementos
	var arrayDropbox = document.getElementById(divCaixa).getElementsByTagName('img');
    var i, j;
  	var correto = 1;

  	if (arrayDropbox.length != tamNucleo){
  		correto = 0;
  	}else{
    	for(i = 0; i < tamNucleo; i++){	
   			if (arrayNucleo[i].getAttribute('src') != arrayDropbox[i].getAttribute('src')){
   				correto = 0;
   				break;
   			}
    	}
  	}
	
    if(correto){
      alert("Você acertou! Fase concluida");
      game(etapaAtual + 1)
    }
    else{
      alert("Que pena, tente novamente!");
    }
  }
/** FIM FUNCOES DO JOGO */

//document.body.onload = game(0);
