const express = require('express');
const router = express.Router({ mergeParams: true });

const BillingsInfoService = require('./billing-info-service');
const HttpUtil = require('../../../utilities/http-util');

// if we want to get fancy we can put these into a dependency injector
const billingsInfoService = new BillingsInfoService();

router.get('', (req, res, next) => {
    let accountId = req.decodedToken.id;

    billingsInfoService.getBillingInfo(accountId).then(billingInfo => {
        res.json({ billingInfo });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {
    let accountId = req.decodedToken.id;

    billingsInfoService.createBillingInfo(accountId, req.body).then(billingInfo => {
        res.json({ billingInfo });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/update', (req, res, next) => {
    let accountId = req.decodedToken.id;

    billingsInfoService.updateBillingInfo(accountId, req.body).then(billingInfo => {
        res.json({ billingInfo });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;