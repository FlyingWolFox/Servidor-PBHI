var botaoImprimir = document.getElementById('botao-imprimir')
botaoImprimir.addEventListener('click',funcaoPDF)

function funcaoPDF(){
    var doc = document.querySelector('#doc');
    let style = document.getElementById('style')
    var a = window.open('', '', '');
            a.document.write('<html>');
            a.document.write("<head><style>")
            a.document.write(style.innerHTML)
            a.document.write("</style></head>");
            a.document.write('<body><div id="box">');
            a.document.write(doc.innerHTML);
            a.document.write('</div></body></html>');
            a.document.close();
            setTimeout(() => {
                a.print();
            }, 50); 
}
