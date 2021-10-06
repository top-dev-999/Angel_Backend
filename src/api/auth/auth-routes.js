const express = require('express');
const router = express.Router();

const AuthService = require('./auth-service');
const ValidationService = require('../../utilities/validation/validation-service');

// if we want to get fancy we can put these into a dependency injector
const authService = new AuthService(); 
const validationService = new ValidationService();

router.post('/register', (req, res, next) => {

    if (!validationService.isValidRegisterBody(req.body)) {
        return res.status(400).send('Invalid payload');
    }

    authService.register(req.body).then(token => {
        res.json({ success: true, token: token });
    }).catch(err => {
        res.json({ success: false, msg: err.message ? err.message : err });
    });
});

router.post('/login', (req, res, next) => {

    authService.login(req.body.email, req.body.password, req.body.rememberUser).then(token => {
        res.json({ success: true, token: token });
    }).catch(err => {
        res.json({ success: false, msg: err.message ? err.message : err });
    });

});

router.post('/forgot-password', (req, res, next) => {

    authService.forgotPassword(req.body.email).then(message => {
        res.json({ success: true, msg: message });
    }).catch(err => {
        res.json({ success: false, msg: err.message ? err.message : err });
    });

});

router.post('/refresh-token', (req, res, next) => {

    authService.refreshToken(req.body.token).then(token => {
        res.json({ success: true, token: token });
    }).catch(err => {
        res.send(401, err.message ? err.message : err);
    });

});

module.exports = router;