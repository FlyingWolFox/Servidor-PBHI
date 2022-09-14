const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "emailatual",
        pass: "senhaatual"
    },
    tls: { rejectUnauthorized: false }
});

const mailOptions = {
    from: 'emailatual',
    to: 'emailparaenviar',
    subject: 'Teste de email',
    text: 'Estou testando enviar emails pelo node js!'
};

const send_mail = () => {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email enviado: ' + info.response);
        }
    });
}

module.exports = send_mail;