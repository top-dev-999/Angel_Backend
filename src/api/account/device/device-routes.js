const express = require('express');
const router = express.Router({ mergeParams: true });

const HttpUtil = require('../../../utilities/http-util');
const roles = require('../../../utilities/roles');
const DeviceService = require('./device-service');

const regionRoutes = require('../region/region-routes');
const wifiRoutes = require('../wifi/wifi-routes');
const deviceLocationRoutes = require('../device-location/device-location-routes');

// if we want to get fancy we can put these into a dependency injector
const deviceService = new DeviceService();

router.use('/:deviceId/region', regionRoutes);
router.use('/:deviceId/wifi', wifiRoutes);
router.use('/:deviceId/location', deviceLocationRoutes);

router.get('', (req, res, next) => {
    let accountId = req.decodedToken.id;
    
    deviceService.getAccountDevices(accountId).then(devices => {
        res.json({ devices });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:deviceId', (req, res, next) => {
    let deviceId = req.params.deviceId;
    let accountId = req.decodedToken.id;

    deviceService.getDevice(accountId, deviceId).then(device => {
        res.json({ device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {
    // if (req.decodedToken.role == roles.ADMIN && req.decodedToken.role == roles.SALES) {
    //     HttpUtil.handleUnauthorized(res);
    //     return;
    // }

    let accountId = req.decodedToken.id;

    deviceService.createDevice(accountId, req.body).then(device => {
        res.json({ device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/update', (req, res, next) => {
    let accountId = req.decodedToken.id;

    deviceService.updateDevice(accountId, req.body).then(device => {
        res.json({ device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/update-state', (req, res, next) => {
    let accountId = req.decodedToken.id;

    deviceService.updateDeviceState(accountId, req.body).then(device => {
        res.json({ device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/setup', (req, res, next) => {
    let accountId = req.decodedToken.id;

    deviceService.setupDevice(accountId, req.body).then(device => {
        res.json({ device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/delete', (req, res, next) => {
    let accountId = req.decodedToken.id;

    deviceService.deleteDevice(accountId, req.body).then(() => {
        res.json({});
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;