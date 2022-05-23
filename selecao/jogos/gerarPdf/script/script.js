var botaoImprimir = document.getElementById('botao-imprimir')
botaoImprimir.addEventListener('click',funcaoPDF)

function funcaoPDF(){
    window.print()
}
