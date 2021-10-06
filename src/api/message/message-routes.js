const express = require('express');
const router = express.Router({ mergeParams: true });
const crypto = require('crypto');

const config = require('../../../config/config');
const MessageService = require('./message-service');
const HttpUtil = require('../../utilities/http-util');

// if we want to get fancy we can put these into a dependency injector
const messageService = new MessageService();

router.post('', (req, res, next) => {

    messageService.handleMessage(req.body, 'clickatell').then(httpReply => {
        res.send(httpReply);
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });

});


router.post('/sms', (req, res, next) => {
    let text = req.body.text;
    let hmac = crypto.createHmac('sha256', config.hmacKey).update(text).digest('hex');

    if (hmac != req.body.hmac) {
        res.status(400).send("invalid request");
        return;
    }

    messageService.handleMessage(req.body, 'proxy phone').then(httpReply => {
        res.send(httpReply);
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/ringing-unit', (req, res, next) => {
    let incomingNumber = req.body.incomingNumber;
    let hmac = crypto.createHmac('sha256', config.hmacKey).update(incomingNumber).digest('hex');

    if (hmac != req.body.hmac) {
        res.status(400).send("invalid request");
        return;
    }

    messageService.handleRingingUnit(incomingNumber, 'ringing unit proxy phone').then(httpReply => {
        res.send(httpReply);
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;