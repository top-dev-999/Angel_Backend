const AuthService = require('../api/auth/auth-service');
const authService = new AuthService();
const roles = require('./roles');
const HttpUtil = require('./http-util');

var exports = module.exports = {};

exports.authentication = function (req, res, next) {
    let path = req.baseUrl;
    if (path.includes('api/auth') || 
        path.includes('api/message') || 
        path.includes('api/user/alarm/info') || 
        path.includes('api/user/alarm/ap') || 
        path.includes('api/order/payment') ||
        (path.includes('api/product') && req.method == 'GET') ||
        !path.includes('api')) {
        next();
        return;
    }

    let authHeader = req.get('Authorization');
    if (!authHeader) { authHeader = ''; }
    authHeader = authHeader.replace('Bearer ', '');
    authHeader = authHeader.replace('bearer ', '');

    authService.isValidToken(authHeader).then(decodedToken => {

        if (path.includes('api/admin') && decodedToken.role != roles.ADMIN) {
            HttpUtil.handleUnauthorized(res);
            return;
        }

        req.decodedToken = decodedToken;
        next();
        
    }).catch(err => {
        res.status(401).send('Unauthorized, please login'); // 401 is unauthorized in http
    });
}