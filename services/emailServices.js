const nodemailer = require('nodemailer');
async function sendMail({from, to, subject , text, html}){
    let transporter = nodemailer.createTransport({
        host:process.env.SMTP_SERVER,
        port:process.env.SMTP_PORT,
        secure:false,
        auth:{
            user:process.env.SMTP_USERID,
            pass:process.env.SMTP_PASSWORD
        }
    });

    let info = await transporter.sendMail({
        from:`Let us share<${from}>`,
        to:to,
        subject:subject,
        text:text,
        html: html
    });
    

}

module.exports = sendMail;