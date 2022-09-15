async function logar_codigo(){
    const codigo = document.getElementById('codigo-professor').value;

    let validacao = await fetch('/professores/conferirCodigo',{
        method:'POST',
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           },
        body: JSON.stringify({
            codigo: codigo
        })
    })
}


async function send_email(){
    const email = document.getElementById('email_professor').value;
    const nome = document.getElementById('nome_professor').value;

    let teste = await fetch('/professores/setProfessorCodigo',{
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