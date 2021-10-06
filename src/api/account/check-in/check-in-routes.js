const express = require('express');
const crypto = require('crypto');
const router = express.Router({ mergeParams: true });

const config = require('../../../../config/config');
const CheckInService = require('./check-in-service');

const HttpUtil = require('../../../utilities/http-util');

const path = require('path');

// if we want to get fancy we can put these into a dependency injector
const checkInService = new CheckInService();

router.get('', (req, res, next) => {
    let accountId = req.decodedToken.id
    
    checkInService.getCheckIns(accountId).then(checkIns => {
        res.json({ checkIns });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:checkInId', (req, res, next) => {
    let accountId = req.decodedToken.id
    let checkInId = req.params.checkInId;
    
    checkInService.getCheckIn(accountId, checkInId).then(checkIn => {
        res.json({ checkIn });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;