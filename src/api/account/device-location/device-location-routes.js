const express = require('express');
const router = express.Router({ mergeParams: true });

const DeviceLocationService = require('./device-location-service');
const HttpUtil = require('../../../utilities/http-util');

// if we want to get fancy we can put these into a dependency injector
const deviceLocationService = new DeviceLocationService();

router.post('', (req, res, next) => {
    const accountId = req.decodedToken.id;
    deviceLocationService.createOrUpdateLocation(accountId, req.body).then((location) => {
        res.json({ location });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;