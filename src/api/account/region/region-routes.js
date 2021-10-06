const express = require('express');
const router = express.Router({ mergeParams: true });

const HttpUtil = require('../../../utilities/http-util');

const RegionService = require('./region-service');
const contactRoutes = require('../contact/contact-routes');

// if we want to get fancy we can put these into a dependency injector
const regionService = new RegionService();

router.use('/:regionId/contact', contactRoutes);

router.get('/:regionId', (req, res, next) => {
    let accountId = req.decodedToken.id
    let deviceId = req.params.deviceId;
    let regionId = req.params.regionId;
    
    regionService.getById(accountId, deviceId, regionId).then(region => {
        res.json({ region });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/create', (req, res, next) => {
    let deviceId = req.params.deviceId;

    regionService.createRegion(deviceId, req.body).then((region) => {
        res.json({ region });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});


router.post('/:regionId', (req, res, next) => {
    
    regionService.updateRegion(req.body).then((region) => {
        res.json({ region });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});


router.post('/:regionId/delete', (req, res, next) => {
    let regionId = req.params.regionId;
    
    regionService.deleteRegion(regionId).then(() => {
        res.json({});
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;