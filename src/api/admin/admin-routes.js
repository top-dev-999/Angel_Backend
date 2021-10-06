const express = require('express');
const router = express.Router({ mergeParams: true });

const HttpUtil = require('../../utilities/http-util');
const AdminService = require('./admin-service');

// if we want to get fancy we can put these into a dependency injector
const adminService = new AdminService();

router.get('/device', (req, res, next) => {
    adminService.getAllDevices().then(devices => {
        res.json({ devices: devices });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/device/:deviceId', (req, res, next) => {
    let deviceId = req.params.deviceId;

    adminService.getDevice(deviceId).then(device => {
        res.json({ device: device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/device', (req, res, next) => {
    let deviceBody = {
        manufactureId: req.body.manufactureId,
        type: req.body.type,
        mode: req.body.mode,
        bssid: req.body.bssid,
        factory: req.body.factory,
        batchNumber: req.body.batchNumber,
        operator: req.body.factoryOperator
    };

    adminService.createDevice(deviceBody).then(device => {
        res.json({ device: device });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/comms', (req, res, next) => {
    
    adminService.getComms().then(comms => {
        res.json({ comms: comms });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;