(async () => {
    let session = await fetch('http://localhost:3000/getstatus');///////////////////////////////
    session = await session.json();
    if(!session.logado && session.ano != undefined){
      console.log('Aluno voltou para o site')
    }
    else if(!session.logado){
      console.log('Aluno não estava logado')
      window.location.href = 'http://localhost:3000/index.html'////////////////////////////////
    }
})()

window.onbeforeunload = () => {
  console.log('logout')
}