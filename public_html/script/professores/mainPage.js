async function logar_codigo(){
    const form = document.getElementById('loginProf-form');
    const codigo = document.getElementById('codigo-professor').value;
    form.addEventListener('submit', event.preventDefault());
    
    const response = await fetch('/professores/conferirCodigo',{
        method:'POST',
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            codigo: codigo
        })
    })
    if(response.status != 200) setMsgResponse(response);
    resultado = await dados.text()
    console.log(resultado)
}


async function send_email(){

    const form = document.getElementById('cadastroProf-form');
    form.addEventListener('submit', event.preventDefault());

    const email = document.getElementById('email_professor').value;
    const nome = document.getElementById('nome_professor').value;

    const response = await fetch('/professores/UpdateProfessorCodigo',{
        method:'POST',
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           },
        body: JSON.stringify({
            email: email,
            nome: nome
        })
    });
    setMsgResponse(response);
}

async function setMsgResponse(response){
    const responseBox = document.getElementById("boxResposta");

    if (response.status == 200){
        responseBox.style.display = "none";
        responseBox.classList.add("sucessMsg");
        responseBox.innerHTML = await response.text()
        responseBox.style.display = "block";
    }else{
        responseBox.style.display = "none";
        responseBox.style.display = "block";
        responseBox.innerHTML = await response.text()
        responseBox.classList.add("errorMsg");
    }
}
