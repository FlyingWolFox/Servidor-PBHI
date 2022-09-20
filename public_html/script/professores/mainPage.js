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
    resultado = await dados.json()
    console.log(resultado[0])
}


async function send_email(){
    const form = document.getElementById('cadastroProf-form');
    form.addEventListener('submit', event.preventDefault());

    const email = document.getElementById('email_professor').value;
    const nome = document.getElementById('nome_professor').value;

    await fetch('/professores/setProfessorCodigo',{
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

async function update_codigo(){
    const form = document.getElementById('updateProf-form');
    form.addEventListener('submit', event.preventDefault());
    const email = document.getElementById('emailProfessor').value;
    console.log(email);
    await fetch('/professores/UpdateProfessorCodigo',{
        method:'POST',
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           },
        body: JSON.stringify({
            email: email,

        })
    });
}