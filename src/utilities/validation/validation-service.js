module.exports = class ValidationService {

    constructor() {}

    isValidRegisterBody(account) {
        if (!this.isValidEmailAddress(account.email)) { return false; }
        if (!this.isValidPassword(account.password)) { return false; }

        return true;
    }

    isValidEmailAddress(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    isValidPassword(password) {
        var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(password);
    }
};