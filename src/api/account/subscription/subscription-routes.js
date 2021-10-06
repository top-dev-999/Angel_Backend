const express = require('express');
const router = express.Router({ mergeParams: true });

const HttpUtil = require('../../../utilities/http-util');

const SubscriptionService = require('./subscription-service');

// if we want to get fancy we can put these into a dependency injector
const subscriptionService = new SubscriptionService();


router.get('/', (req, res, next) => {
    let accountId = req.decodedToken.id
    
    subscriptionService.getSubscriptions(accountId).then(subscriptions => {
        res.json({ subscriptions: subscriptions });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:productId', (req, res, next) => {
    let accountId = req.decodedToken.id
    let productId = req.params.productId;
    
    subscriptionService.getSubscriptionInfo(accountId, productId).then(subscriptionInfo => {
        res.json({ subscriptionInfo: subscriptionInfo });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/create', (req, res, next) => {    
    let productId = req.body.productId;
    let accountId = req.decodedToken.id;

    subscriptionService.createSubscription(productId, accountId).then((subscription) => {
        res.json({ subscription: subscription });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/cancel', (req, res, next) => {
    let productId = req.body.productId;
    let accountId = req.decodedToken.id;

    subscriptionService.cancelSubscription(accountId, productId).then((subscription) => {
        res.json({ subscription: subscription });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;