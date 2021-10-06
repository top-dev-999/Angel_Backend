const express = require('express');
const router = express.Router({ mergeParams: true });

const WifiService = require('./wifi-service');
const HttpUtil = require('../../../utilities/http-util');

// if we want to get fancy we can put these into a dependancy injector
const wifiService = new WifiService();

// WIFI SECTION
router.get('/:wifiId', (req, res, next) => {
    let wifiId = req.params.wifiId;
    let deviceId = req.params.deviceId;
    let accountId = req.decodedToken.id
    
    wifiService.getWifiById(wifiId, deviceId, accountId).then(wifi => {
        res.json({ wifi: wifi });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/index/:index', (req, res, next) => {
    let deviceId = req.params.deviceId;
    let index = req.params.index;
    
    wifiService.getWifiByIndex(deviceId, index).then(wifi => {
        res.json({ wifi: wifi });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {

    wifiService.createWifi(req.decodedToken.id, req.params.deviceId, req.body).then((wifi) => {
        res.json({ wifi });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/:wifiId', (req, res, next) => {
    let wifi = {
        id: req.params.wifiId,
        
        ssid: req.body.ssid,
        password: req.body.password,
        latitude: req.body.latitude,
        longitude: req.body.longitude
    };
    
    wifiService.updateWifi(req.decodedToken.id, req.params.deviceId, req.body).then((wifi) => {
        res.json({ wifi });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/:wifiId/delete', (req, res, next) => {
    let wifi = {
        id: req.params.wifiId,
        accountId: req.decodedToken.id,
        deviceId: req.params.deviceId
    };
    
    wifiService.deleteWifi(wifi).then(() => {
        res.json({});
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;