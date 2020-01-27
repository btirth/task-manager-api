const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'emailtirth@gmail.com',
        subject: 'Welcome to Task-manager App',
        text: `Dear ${name} We are glad to having you on our plateform. Let us know your experiance`
        //html:     we can also use html code here
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'emailtirth@gmail.com',
        subject: 'Sorry to see you go',
        text: `Goodbye, ${name}. I hope to see you back sometime soon`

    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}