async function logar_codigo(){
    const form = document.getElementById('loginProf-form');
    const codigo = document.getElementById('codigo-professor').value;
    form.addEventListener('submit', event.preventDefault());
    
    let dados = await fetch('/professores/conferirCodigo',{
        method:'POST',
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            codigo: codigo
        })
    })
    resultado = await dados.text()
    console.log(resultado)
}


async function send_email(){
    const form = document.getElementById('cadastroProf-form');
    form.addEventListener('submit', event.preventDefault());

    const email = document.getElementById('email_professor').value;
    const nome = document.getElementById('nome_professor').value;

    await fetch('/professores/UpdateProfessorCodigo',{
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
}

