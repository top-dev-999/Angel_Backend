const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('../../../config/config');
const randomString = require('../../utilities/random-string');
const roles = require('../../utilities/roles');
const Account = require('../../models/account');
const EmailService = require('../../utilities/email/email-service');

const ONE_DAY = 86400;

module.exports = class AuthService {
    constructor() {
        this.emailService = new EmailService();
    }

    async register(account) {
        account.email = account.email.toLowerCase();
        let existingAccount = await Account.findByEmail(account.email);
        if (existingAccount) {
            throw new Error('The email address is already registered');
        }

        let dbAccount = await Account.create({
            email: account.email,
            password: account.password,
            role: roles.USER
        });

        this.emailService.sendRegistrationEmailTo(dbAccount);

        return this.getJwtToken(dbAccount, false);
    }

    getJwtToken(account, remember) {
        let payload = {
            id: account.id,
            email: account.email,
            role: account.role,
            remember: remember
        };

        return jwt.sign(payload, config.secret, { expiresIn: ONE_DAY });
    }

    async login(email, password, remember) {
        email = email.toLowerCase();
        let account = await Account.findByEmail(email);
        if (!account) {
            throw new Error('No account with that email address exists');
        }

        let isValidPassword = await this.validatePassword(account, password);
        if (isValidPassword) {
            return this.getJwtToken(account, remember);
        } else {
            throw new Error('Invalid Password'); 
        }
    }

    validatePassword(account, password) {
        return bcrypt.compare(password, account.password);
    }

    async forgotPassword(email) {
        email = email.toLowerCase();
        let account = await Account.findByEmail(email)
        if (!account) {
            throw new Error('No account with that email address exists');
        }

        let newPassword = randomString.generate(8);
        await Account.updatePassword(account, newPassword);

        this.emailService.sendForgotPasswordEmailTo(account, newPassword);

        return 'An email with your new password has been sent to your email address';
    }

    async refreshToken(token) {
        let decodedToken = jwt.decode(token);
        if (!decodedToken.remember) {
            throw new Error('Invalid token');
        }

        let accountId = null;

        try {
            let validToken = await this.isValidToken(token);
            accountId = validToken.id;
        } catch(err) {
            if (err.name == 'TokenExpiredError') {
                accountId = decodedToken.id;
            }
        };

        let account = await Account.getById(accountId);
        if (!account) {
            throw new Error('Account does not exist');
        }
        return this.getJwtToken(account, true);
    }

    isValidToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.secret, (err, account) => {
                if (err) {
                    return reject(err);
                }
                resolve(account);
            });
        });
    }
};