const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "temlogica@lavid.ufpb.br",
        pass: "l4v1d-l1v3"
    },
    tls: { rejectUnauthorized: false }
});


const send_mail = async (email,codigo) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'temlogica@lavid.ufpb.br',
            to: email,
            subject: 'Código de acesso como professor no projeto Tem Lógica',
            text: 'Olá, seu código de acesso no projeto Tem Lógica é:' + codigo + '\n\Use o link https://temlogica.lavid.ufpb.br/professores.html para acessar o sistema.\n\Atenciosamente, equipe do Lavid.\n\Não responda esse email.'
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              reject(error)
            } else {
            //   console.log('Email enviado: ' + info.response);
              resolve(info.response)
            }
        });        
    })
}

module.exports = send_mail;