const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "riquependragon@gmail.com",
        pass: "gjgztyzjxrtrcmam"
    },
    tls: { rejectUnauthorized: false }
});


const send_mail = (email,codigo) => {
    
    const mailOptions = {
        from: 'riquependragon@gmail.com',
        to: email,
        subject: 'Código de acesso como professor',
        text: 'Seu novo código é '+codigo
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email enviado: ' + info.response);
        }
    });
}

module.exports = send_mail;