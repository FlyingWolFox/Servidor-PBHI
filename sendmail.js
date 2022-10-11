const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "riquependragon@gmail.com",
        pass: "gjgztyzjxrtrcmam"
    },
    tls: { rejectUnauthorized: false }
});


const send_mail = async (email,codigo) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'riquependragon@gmail.com',
            to: email,
            subject: 'Código de acesso como professor',
            text: 'Seu novo código é '+codigo
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