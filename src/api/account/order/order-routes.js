const express = require('express');
const router = express.Router({ mergeParams: true });

const roles = require('../../../utilities/roles');
const HttpUtil = require('../../../utilities/http-util');
const OrderService = require('./order-service');

// if we want to get fancy we can put these into a dependency injector
const orderService = new OrderService();

router.get('/all', (req, res, next) => {
    if (req.decodedToken.role != roles.ADMIN) {
        HttpUtil.handleUnauthorized(res);
        return;
    }
    
    orderService.getAllOrders().then(orders => {
        res.json({ orders });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('', (req, res, next) => {
    let accountId = req.decodedToken.id;
    
    orderService.getAccountOrders(accountId).then(orders => {
        res.json({ orders });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:orderId', (req, res, next) => {
    let orderId = req.params.orderId;
    let accountId = req.decodedToken.id;
    let isAdmin = req.decodedToken.role == roles.ADMIN;

    orderService.getOrder(orderId, accountId,  isAdmin).then(order => {
        res.json({ order });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {
    let accountId = req.decodedToken.id;

    orderService.createOrder(accountId, req.body).then(order => {
        res.json({ order });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/payment', (req, res, next) => {
    
    orderService.handlePayfastPayment(req.body).then(() => {
        res.json({});
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/:orderId', (req, res, next) => {
    if (req.decodedToken.role != roles.ADMIN) {
        HttpUtil.handleUnauthorized(res);
        return;
    }

    let orderId = req.params.orderId;

    orderService.updateOrder(orderId, req.body).then(order => {
        res.json({ order });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;