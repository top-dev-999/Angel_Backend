const Account = require('../../models/account');

const AuthService = require('../auth/auth-service');
const HttpUtil = require('../../utilities/http-util');

module.exports = class AccountService {

    constructor() {
        this.authService = new AuthService();
    }

    async updatePassword(decodedToken, currentPassword, newPassword) {
        let account = await Account.findById(decodedToken.id);
        if (!account) {
            HttpUtil.throw400Error('Invalid Request');
        }

        let isPasswordValid = await this.authService.validatePassword(account, currentPassword);
        if (isPasswordValid) {
            await Account.updatePassword(account, newPassword);
        } else {
            HttpUtil.throw400Error('Invalid password');
        }
        
        return 'Your password has been successfully updated';
    }
};