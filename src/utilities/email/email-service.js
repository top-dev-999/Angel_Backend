const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const config = require('../../../config/config');

module.exports = class EmailService {
    
    constructor() {
        this.from = 'noreply@angelasp.co.za';

        this.transporter = nodemailer.createTransport({ 
            host: 'mail.angelasp.co.za',
            port: 465,
            secure: true,
            auth: {
                user: this.from,
                pass: 'Qwerty123456'
            }
        });
    }

    getMailOptions(email, subject, body) {
        return {
            from: this.from,
            to: email,
            subject: subject,
            html: body
        };
    }
    
    sendEmail(email, subject, body) {
        return new Promise((resolve, reject) => {
            let mailOptions = this.getMailOptions(email, subject, body);
            this.transporter.sendMail(mailOptions, (err, res) => {
                if (err) { return reject(err); }
                resolve(res);
            });
        });
    }

    sendRegistrationEmailTo(user) {
        let path = 'user-welcome.html';
        let replacements = {
            userEmail: user.email,
            baseUrl: config.baseUrl
        };

        let body = this.getBody(path, replacements);
        let subject = 'Welcome to Angel Aspirations';
        return this.sendEmail(user.email, subject, body);
    }

    sendForgotPasswordEmailTo(user, newPassword) {
        let path = 'password-reset.html';
        let replacements = {
            userEmail: user.email,
            newPassword: newPassword,
            baseUrl: config.baseUrl
        };
        
        let body = this.getBody(path, replacements);
        let subject = 'Angel Aspirations Password Reset';
        return this.sendEmail(user.email, subject, body);
    }

    getBody(file, replacements) {
        let filePath = path.join(__dirname, "../../email-templates", file);
        let data = fs.readFileSync(filePath);
        let html = data.toString();
        let template = handlebars.compile(html);
        return template(replacements);
    }
};