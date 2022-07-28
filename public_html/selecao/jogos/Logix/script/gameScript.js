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
const anosEnum = Object.freeze({
	"Primeiro ano": 1,
	"Segundo ano": 2,
	"Terceiro ano": 3,
	"Quarto ano": 4,
	"Quinto ano": 5,
	"Sexto ano": 6
});
const forma = 0, cor = 1, tamanho = 2, contorno = 3;

// IDs dos containers

const divNucleo = document.getElementById("container-nucleo");
const divImgs = document.getElementById("container-formas");
const divCaixa = 'container-sequencia';
const textNumeroFase = document.getElementById('textbox-numero-fase');
const textTutorial = document.getElementById("texto-textbox")
const divEstrelas = 'container-estrelas';
/** FIM CONSTANTES */

/** VARIAVEIS GLOBAIS COMPARTILHADAS ENTRE AS FUNCOES */

var arrayCaixa = []; //Elementos colocados na caixa de resposta
var arrayNucleo = []; //Array para guardar o nucleo
var arraySequencia = []; //Array para guardar a sequecia
var arrayOpcoes = []; //Array contendo todos os elementos gerados nas opcoes
var tamNucleo; //Quantos elementos o nucleo possui
var nSlots; //quantas vezes o nucleo se repete na resposta
var etapaAtual = 0; //Representa o nível do jogo
var estrela = 0;  //Contagem das estrelas 
var restricoesColunas = []; //Guarda as restrições da coluna
var restricoesLinhas = [];  //Guarda as restrições da linha
var endGame = false; //Indica se o jogo terminou ou não
var arrayEstrelas = document.getElementById(divEstrelas).getElementsByTagName('img');
var ano = localStorage.getItem('ano');
var etapaMax = 17;
var timeStamps = [];
/** FIM VARIAVEIS */

/** FUNCOES DE APOIO */

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFasesPorAno(){
	switch(ano){
		case "Primeiro ano":
			etapaMax = 200;
			break;
		case "Segundo ano":
			etapaMax = 200;
			break;
		case "Terceiro ano":
			etapaMax = 200;
			break;
		case "Quarto ano":
			etapaMax = 200;
			break;
		case "Quinto ano":
			etapaMax = 200;
			break;
		case "Sexto ano":
			etapaMax = 200;
			break;			
	}
	console.log("esse eh o numero maximo de fases desse ano: " + etapaMax);
}
getFasesPorAno();
function resetaTimeStamps(){
	let tamanho = timeStamps.length;
	for(let i = 0; i < tamanho; i++){
		console.log(`timestamp ${i}: ${timeStamps.pop()}`);
	}
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

    src += '../img/restricoes/' + alt + '.svg';
    novaImg.setAttribute('src', src);
    novaImg.setAttribute('alt', srcAlt);
    novaImg.setAttribute('title', srcAlt);


    return novaImg;
}

function novaImgBlocoLogicoComRestricoes() {
	var novaImg = document.createElement("img");
	var cor, tipo, tam, cont, arq;

	cor = getRandomIntInclusive(0, 2);
	tipo = getRandomIntInclusive(0, 3);
	tam = getRandomIntInclusive(0, 1);
	cont = getRandomIntInclusive(0, 1);

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

	return novaImg;
}

function gerarDrop(qtdNaColuna){
	for (i = 0; i < qtdNaColuna.length; i++) {
		var novoColuna = document.createElement("div");
		for (j = 0; j < qtdNaColuna[i]; j++) {
			var novoContencao = document.createElement("div");
			var novoDrop = document.createElement("div");
			novoContencao.classList.add("contencao")
			novoDrop.classList.add("content-div")
			novoDrop.classList.add("dropzone")
			novoDrop.setAttribute("nmr-coluna",i)
			novoColuna.classList.add("colunas")
			novoDrop.setAttribute("nmr-linha",j)
			novoColuna.appendChild(novoDrop)
		}
		divNucleo.appendChild(novoColuna)
	}
}

function conferirRest(novaImagem,restricoesColuna,restricoesLinha){ //Confere as restrições das linhas 
	var flagr = 0;

	for(i = 0; i < restricoesColuna.length; i++){
		//Identifica se as restrições das linhas são negam as restrições das colunas por meio do seu estado. Ex: Se a coluna pedir grande e a linha pedir grande com negação
		altAtual = restricoesColuna[i].alt.toLowerCase();
		novoAlt = novaImagem.alt.toLowerCase();
		var sepAlt = novoAlt.split(" ")
		var sepColAlt = altAtual.split(" ")

		if(sepAlt[0] != "não"){
			if(altAtual ==  "não "+novoAlt){
				console.log("Restrições Contrarias")
				flagr++
			}
		}
		else if(sepAlt[0] == "não"){
			if("não "+altAtual ==  novoAlt){
				console.log("Restrições Contrarias")
				flagr++
			}
		}

		//Identifica se as restrições das linhas negam as restrições das colunas por meio de diferenças de cores ou forma. Ex: Se a coluna pedir amarelo e a linha pedir vermelho
		if(sepAlt[0] != "não"){
			switch(sepAlt[sepAlt.length-1]){
				case "quadrados":
					switch(sepColAlt[sepColAlt.length-1]){
						case "círculos":
							flagr++
							break;
						case "retângulos":
							flagr++
							break;
						case "triângulos":
							flagr++
							break;
					}
					break;
				case "retângulos":
					switch(sepColAlt[sepColAlt.length-1]){
						case "círculos":
							flagr++
							break;
						case "triângulos":
							flagr++
							break;
						case "quadrados":
							flagr++
							break;
					}
					break;
				case "círculos":
					switch(sepColAlt[sepColAlt.length-1]){
						case "triângulos":
							flagr++
							break;
						case "retângulos":
							flagr++
							break;
						case "quadrados":
							flagr++
							break;
					}
					break;
				case "triângulos":
					switch(sepColAlt[sepColAlt.length-1]){
						case "círculos":
							flagr++
							break;
						case "retângulos":
							flagr++
							break;
						case "quadrados":
							flagr++
							break;
					}
					break;
				case "amarelas":
					switch(sepColAlt[sepColAlt.length-1]){
						case "azuis":
							flagr++
							break;
						case "vermelhas":
							flagr++
							break;
					}
					break;
				case "vermelhas":
					switch(sepColAlt[sepColAlt.length-1]){
						case "amarelas":
							flagr++
							break;
						case "azuis":
							flagr++
							break;
					}
					break;
				case "azuis":
					switch(sepColAlt[sepColAlt.length-1]){
						case "amarelas":
							flagr++
							break;
						case "vermelhas":
							flagr++
							break;
					}
					break;
			}
		}

		//Identifica se as restrições das linhas são negam as restrições das colunas por meio de diferenças. Ex: Se a coluna pedir grande e a linha pequeno
		if(sepAlt[0] == "não" && sepColAlt[0] == "não"){
			novoAlt = novoAlt.substr(4);
			altAtual = altAtual.substr(4);
		}
		switch(novoAlt){
			case "podem peças que são pequenas":
				if(altAtual == 'podem peças que são grandes'){
					flagr++
					console.log("p & g");
				}
				break;
			case "podem peças que são grandes":
				if(altAtual == 'podem peças que são pequenas'){
					flagr++
					console.log("g & p");
				}
				break;
			case "podem peças que tem contorno":
				if(altAtual == 'podem peças que não tem contorno'){
					flagr++
					console.log("c & s");
				}
				break;
			case "podem peças que não tem contorno":
				if(altAtual == 'podem peças que tem contorno'){
					flagr++
					console.log("s & c");
				}
				break;
		}
	}
	//Verifica se as restrições das linhas são iguais
	if(restricoesLinha.length != null){
		for(i = 0; i < restricoesLinha.length; i++){
			if(novaImagem.alt == restricoesLinha[i].alt){
				flagr++;
			}
		}
	}
	return flagr
}

function conferirRestCol(novaImagem,restricoesColuna){//Confere as restrições das colunas
	var flagr = 0;
	if(restricoesColuna.length != null){
		for(i = 0; i < restricoesColuna.length; i++){
			if(novaImagem.alt == restricoesColuna[i].alt){
				flagr++;
			}
		}
	}
	return flagr
}

function gerarRestricoes(qtdNaColuna,restC,restL){
	var restricoesColuna = new Array(); //Armazena as restrições localizadas nas colunas
	var restricoesLinha = new Array(); //Armazena as restrições localizadas nas colunas
	var colunas = divNucleo.childNodes; //Pega todas aas colunas do jogo
	var restricaoLinha = document.createElement("div") //Elemento que armazenará as restrições localizadas nas linhas 
	restricaoLinha.classList.add("restricaoLinha")
	document.getElementById('container-nucleo').style.marginLeft = '0'
	document.getElementById('container-nucleo').style.marginTop = '0'

	for (i = 0; i < colunas.length;i++){
		var novorestricao = document.createElement("div")
		novorestricao.classList.add("restricao")
		colunas[i].insertBefore(novorestricao,colunas[i].childNodes[0])
	}	
	for (i = 0; i < restC; i++){
		if(Math.max.apply(null, qtdNaColuna) == 1){
			document.getElementById('container-nucleo').style.marginTop = '-40px'
		}
		var flagr = 99;
		while(flagr != 0){
			//Gerar aleatoriamente os valores
			var estadoRestricao = getRandomIntInclusive(0,1)
			var tipoRestricao = getRandomIntInclusive(0,3)
			var valorRestricao;
			estadoRestricao === 0 ? estadoRestricao = "Aceito": estadoRestricao =  "Negado";
			switch (tipoRestricao) {
				case 0: 
					valorRestricao = getRandomIntInclusive(0,3);
				break;
				case 1: 
					valorRestricao = getRandomIntInclusive(0,2);
				break;
				case 2: 
					valorRestricao = getRandomIntInclusive(0,1);
				break;
				case 3: 
					valorRestricao = getRandomIntInclusive(0,1);
				break;
			}
			novaImagem = getRestrictScr(estadoRestricao, tipoRestricao, valorRestricao);
			flagr = conferirRestCol(novaImagem,restricoesColuna)
		}

		//Adicionando as restrições às colunas
		colunas[i].removeChild(colunas[i].childNodes[0])
		var novorestricao = document.createElement("div")
		novorestricao.classList.add("restricao")
		novorestricao.classList.add("restricaoColuna")
		novorestricao.appendChild(novaImagem);
		restricoesColunas.push([estadoRestricao,tipoRestricao,valorRestricao])
		restricoesColuna.push(novaImagem)
		colunas[i].insertBefore(novorestricao,colunas[i].childNodes[0])
	}
	divNucleo.insertBefore(restricaoLinha,divNucleo.childNodes[0])
	for (i = 0; i < restL; i++){
		document.getElementById('container-nucleo').style.marginLeft = '-50px'
		var flagr = 99;
		while(flagr != 0){
			//Gerar aleatoriamente os valores
			var estadoRestricao = getRandomIntInclusive(0,1)
			var tipoRestricao = getRandomIntInclusive(0,3)
			var valorRestricao;
			estadoRestricao === 0 ? estadoRestricao = "Aceito": estadoRestricao =  "Negado";
			switch (tipoRestricao) {
				case 0: 
					valorRestricao = getRandomIntInclusive(0,3);
				break;
				case 1: 
					valorRestricao = getRandomIntInclusive(0,2);
				break;
				case 2: 
					valorRestricao = getRandomIntInclusive(0,1);
				break;
				case 3: 
					valorRestricao = getRandomIntInclusive(0,1);
				break;
			}
			novaImagem = getRestrictScr(estadoRestricao, tipoRestricao, valorRestricao);
			flagr = conferirRest(novaImagem,restricoesColuna,restricoesLinha)
		}

		//Adicionando as restrições às colunas
		var novorestricao = document.createElement("div")
		novorestricao.classList.add("restricao")
		novorestricao.classList.add("restLinha")
		novorestricao.setAttribute("id","restLinha"+i)
		novaImagem = getRestrictScr(estadoRestricao, tipoRestricao, valorRestricao);
		novaImagem.setAttribute('class', 'img-restricao-esquerda');
		novorestricao.appendChild(novaImagem);
		restricoesLinhas.push([estadoRestricao,tipoRestricao,valorRestricao])
		restricoesLinha.push(novaImagem)
		restricaoLinha.insertBefore(novorestricao,restricaoLinha.childNodes[i]);
	}
}

function reset(){
	divImgs.innerHTML = '';
	divNucleo.innerHTML = '';
		
	restricoesColunas = [];
	restricoesLinhas = [];
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
		document.querySelector('body').insertBefore(confete,document.querySelector('body').childNodes[0]);
	}
}

function stopChuva(){
    var filhos = document.querySelector('body').querySelectorAll('.gota')
    filhos.forEach(filho => {
        filho.parentElement.removeChild(filho)
    })
}

function game(){
	var contador = 0;
	reset()
	textNumeroFase.innerHTML = (etapaAtual+1);

	//Fases do jogo
	switch (etapaAtual) {
		case 0:
			textTutorial.innerHTML = "Se atente as restrições acima das áreas azuis, identifique as suas características e arraste as peças disponíveis no fundo da página para a área do núcleo";
			nmrImgs = 1;
			qtdNaColuna = [1];//Número de drops nas colunas. Max = 3
			restricaoColuna = 1; //Número de restrições que ficarão acima das colunas
			restricaoLinha = 0; //Número de restrições que ficarão à esquerda das linhas
			break;
		case 1:
			nmrImgs = 2;
			qtdNaColuna = [1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 2:
			nmrImgs = 2;
			qtdNaColuna = [1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 3:
			nmrImgs = 2;
			qtdNaColuna = [1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 4:
			nmrImgs = 2;
			qtdNaColuna = [1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 5:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 6:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 7:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 8:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 9:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 10:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 11:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 0; 
			break;
		case 12:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 13:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 14:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 2;
			restricaoLinha = 0; 
			break;
		case 15:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 0;
			restricaoLinha = 1; 
			break;
		case 16:
			nmrImgs = 4;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 1; 
			break;
		case 17:
			nmrImgs = 4;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 3;
			restricaoLinha = 1; 
			break;
		case 18:
			nmrImgs = 3;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 2;
			restricaoLinha = 1; 
			break;
		case 19:
			nmrImgs = 4;
			qtdNaColuna = [1,1,1];
			restricaoColuna = 2;
			restricaoLinha = 1; 
			break;
		case 20:
			nmrImgs = 4;
			qtdNaColuna = [2,1,1];
			restricaoColuna = 3;
			restricaoLinha = 1; 
			break;
		case 21:
			nmrImgs = 4;
			qtdNaColuna = [2,1,1];
			restricaoColuna = 3;
			restricaoLinha = 1; 
			break;
		case 22:
			nmrImgs = 4;
			qtdNaColuna = [2,1,1];
			restricaoColuna = 3;
			restricaoLinha = 2; 
			break;
		case 23:
			nmrImgs = 5;
			qtdNaColuna = [2,2,1];
			restricaoColuna = 3;
			restricaoLinha = 1; 
			break;
		case 24:
			nmrImgs = 5;
			qtdNaColuna = [2,2,1];
			restricaoColuna = 3;
			restricaoLinha = 2; 
			break;
		case 25:
			nmrImgs = 5;
			qtdNaColuna = [2,2,1];
			restricaoColuna = 3;
			restricaoLinha = 2; 
			break;
		case 26:
			nmrImgs = 6;
			qtdNaColuna = [2,2,2];
			restricaoColuna = 2;
			restricaoLinha = 2; 
			break;
		case 27:
			nmrImgs = 6;
			qtdNaColuna = [2,2,2];
			restricaoColuna = 2;
			restricaoLinha = 2; 
			break;
		case 28:
			nmrImgs = 6;
			qtdNaColuna = [2,2,2];
			restricaoColuna = 3;
			restricaoLinha = 2; 
			break;
		case 29:
			nmrImgs = 6;
			qtdNaColuna = [2,2,2];
			restricaoColuna = 3;
			restricaoLinha = 2; 
			endGame = true;
			break;
		case 50:
			nmrImgs = 6;
			qtdNaColuna = [2,2,2];
			restricaoColuna = 3;
			restricaoLinha = 2; 
			break;
		}

	gerarDrop(qtdNaColuna); //Função que gera as dropzones
	gerarRestricoes(qtdNaColuna,restricaoColuna,restricaoLinha); //Função que gera as restrições

	arrayOriginal = [];
	//Adiciona as imagens no jogo
	
	if(qtdNaColuna.length>=Math.max.apply(null, qtdNaColuna )){
		for(k = 0; k < qtdNaColuna.length; k++){
			for (j = 0; j< qtdNaColuna[k]; j++) {
				do{
					arrayNucleo[i] = novaImgBlocoLogicoComRestricoes();
					var cont = verificar(arrayNucleo[i],restricoesColunas[k],restricoesLinhas[j]);
				}
				while(cont!=0);
				contador++;
				divImgs.insertBefore(arrayNucleo[i],divImgs.childNodes[getRandomIntInclusive(0,contador)])
				if (contador==nmrImgs) break;
			}
			if(contador==nmrImgs) break;	
		}
	}
	else{
		for(j = 0; j<3; j++){
			for (k = 0; k< 3; k++) {
				do{
					arrayNucleo[i] = novaImgBlocoLogicoComRestricoes();
					var cont = verificar(arrayNucleo[i],restricoesColunas[j],restricoesLinhas[k]);
					
				}
				while(cont!=0);
				divImgs.appendChild(arrayNucleo[i])
				contador++;
				if (contador==nmrImgs) break;
			}
			if(contador==nmrImgs) break;	
		}
	}
}	
resetEstrelas()
function check(){
	var colunas = document.getElementsByClassName("colunas");
	var aux = 0;
	var textoAcerto = document.getElementById('resultado-jogo');
    var textoErro = document.getElementById('resultadoNegativo-jogo')
    var modalAcerto = document.getElementById("modalAcerto");
    var modalErro = document.getElementById('modalErro');
    var botaoOk = document.getElementById('botao-proximo');
	var modalFim = document.getElementById('modalFim')
	var btnReiniciar = document.getElementById('botao-restart')
	var breakF = 0;

	Array.prototype.forEach.call(colunas, el => {
		var drops = el.getElementsByClassName("dropzone")
		Array.prototype.forEach.call(drops,el => {
			//console.log(el)
			var colunaAtual = el.getAttribute("nmr-coluna")
			var linhaAtual = el.getAttribute("nmr-linha")
			if(el.childNodes[0] != null){
				aux += verificar(el.childNodes[0],restricoesColunas[colunaAtual],restricoesLinhas[linhaAtual]);
			}
			else{
				modalErro.style.display = 'block';
				textoErro.innerText = 'Que pena, tente novamente.';
				breakF = 1;
				resetaTimeStamps();
			}	
		});
	})
	if(breakF == 1){
		return 0;
	}
	if(aux == 0){
		if(endGame == false && etapaAtual <= etapaMax){
		modalAcerto.style.display = 'block';
                textoAcerto.innerText = 'Você acertou! Fase concluída.';
                botaoOk.innerHTML = "Próxima"; 
                botaoOk.onclick = function (event){
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
                        case 11:
                        case 12:
                        case 13:
                        case 14:
							var texto = document.getElementById('texto2');
							texto.innerHTML = etapaAtual.toString() + "/15";
							break;  
                        case 15:
							arrayEstrelas[1].setAttribute('src', '../img/estrelas/star1.svg');
                            var texto = document.getElementById('texto2');
                            texto.innerHTML = etapaAtual.toString() + "/15";
                            break;
                        case 16:
                        case 17:
                        case 18:
                        case 19: 
                        case 20:
                        case 21:
                        case 22:
                        case 23:
                        case 24:   
							var texto = document.getElementById('texto3');
                            texto.innerHTML = etapaAtual.toString() + "/25";
                            break;                  
                        case 25:     
							arrayEstrelas[2].setAttribute('src', '../img/estrelas/star1.svg');
							var texto = document.getElementById('texto3');
							texto.innerHTML = etapaAtual.toString() + "/25";
							break;    
                        case 26:
                        case 27:
                        case 28:
                        case 29:
							var texto = document.getElementById('texto4');
                            texto.innerHTML = etapaAtual.toString() + "/30";
                            break;
                        case 30:
							arrayEstrelas[3].setAttribute('src', '../img/estrelas/star1.svg');
                            var texto = document.getElementById('texto4');
                            texto.innerHTML = etapaAtual.toString() + "/30";
                            break;
                        default:
                            break;
                    }
                    game();
                    modalAcerto.style.display = 'none';
					resetaTimeStamps();
                }
            } 
		else{
			chuva();
			btnReiniciar.onclick = function (event){
				stopChuva()
				etapaAtual = 0;	
				endGame = false;
				resetaTimeStamps();
				resetEstrelas();
				game();
				modalFim.style.display = 'none';
			}
			modalFim.style.display = 'flex';
		}
	}
	else{
		modalErro.style.display = 'block';
		textoErro.innerText = 'Resposta errada... Tente novamente!';
		resetaTimeStamps();
	}	
}

function verificar(img,restC,restL){
	var flag = 0;
	var restTipoL,restTipoC;
	try {
		switch(restC[1]){
			case 0:
				restTipoC = "tipo"
				break;
			case 1:
				restTipoC = "cor"
				break;
			case 2:
				restTipoC = "tam"
				break;
			case 3:
				restTipoC = "cont"
				break;
		}
	} catch (error) {
		restC = ["Negado",parseInt(img.getAttribute("cor"))+1,0]
		restTipoC = 0;
	}
	try {
		switch(restL[1]){
			case 0:
				restTipoL = "tipo"
				break;
			case 1:
				restTipoL = "cor"
				break;
			case 2:
				restTipoL = "tam"
				break;
			case 3:
				restTipoL = "cont"
				break;
		}
	} catch (error) {
		restL = ["Negado",parseInt(img.getAttribute("cor"))+1,0]
		restTipoL = 0;
	}

	if(restC[0] != null && restC[0] == 'Aceito'){
		if(restC[2]!=null && img.getAttribute(restTipoC) != restC[2]){
	          		flag++;
        }
	}
	if(restC[0] != null && restC[0] == 'Negado'){
		if(restC[2]!=null && img.getAttribute(restTipoC) == restC[2]){
            		flag++;			
        }
	}
	if(restL[0] != null && restL[0] == 'Aceito'){
		if(restL[2]!=null && img.getAttribute(restTipoL) != restL[2]){
	          		flag++;
        }
	}
	if(restL[0] != null && restL[0] == 'Negado'){
		if(restL[2]!=null && img.getAttribute(restTipoL) == restL[2]){
            		flag++;			
        }
	}

	if(flag != 0 && img.parentElement != null){
		img.parentElement.style.backgroundColor = "#e25b4048"
	}
	return flag;
}

function fecharModal(){
	var modalAcerto = document.getElementById("modalAcerto");
    var modalErro = document.getElementById('modalErro');
	modalAcerto.style.display = 'none';
	modalErro.style.display = 'none';
}

function reiniciar(){
	game()
}

game()

document.addEventListener("dragstart", function( event ) {
	if(event.target.parentElement.getAttribute("class").split(" ")[0] == "content-div"){
		event.target.parentElement.style.backgroundColor = "rgba(65, 187, 194, 0.1)";
	}
}, false);