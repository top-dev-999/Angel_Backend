const express = require('express');
const router = express.Router({ mergeParams: true });

const HttpUtil = require('../../../utilities/http-util');

const InvoiceService = require('./invoice-service');

// if we want to get fancy we can put these into a dependency injector
const invoiceService = new InvoiceService();


router.get('/', (req, res, next) => {
    let accountId = req.decodedToken.id;

    invoiceService.getInvoices(accountId).then((invoices) => {
        res.json({ invoices });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:invoiceId', (req, res, next) => {
    let invoiceId = req.params.invoiceId;
    let accountId = req.decodedToken.id;

    invoiceService.getById(invoiceId, accountId).then((invoices) => {
        res.json({ invoices: invoices });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;