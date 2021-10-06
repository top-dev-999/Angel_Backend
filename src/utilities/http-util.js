var exports = module.exports = {};

exports.throw400Error = (error) => {
    throw new Error('400:message:' + error);
};

exports.throw500Error = (error) => {
    throw new Error('500:message:' + error);
};

exports.handleError = (err, res) => {
    let msg = err.message ? err.message : err;

    if (msg.indexOf('400:message:') >= 0) {
        msg = msg.replace('400:message:', '');
        res.status(400).send(msg);
    } else if (msg.indexOf('500:message:') >= 0) {
        msg = msg.replace('500:message:', '');
        res.status(5000).send(msg);
    } else {
        res.status(500).send(msg);
    }
};

exports.handleUnauthorized = (res) => {
    res.status(401).send('Unauthorized, not enough permission');
};
