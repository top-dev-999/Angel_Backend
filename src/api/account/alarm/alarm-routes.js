const express = require('express');
const crypto = require('crypto');
const router = express.Router({ mergeParams: true });

const config = require('../../../../config/config');
const AlarmService = require('./alarm-service');

const HttpUtil = require('../../../utilities/http-util');

const path = require('path');

// if we want to get fancy we can put these into a dependency injector
const alarmService = new AlarmService();

router.get('', (req, res, next) => {
    let accountId = req.decodedToken.id
    
    alarmService.getAlarms(accountId).then(alarms => {
        res.json({ alarms });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:alarmId', (req, res, next) => {
    let accountId = req.decodedToken.id
    let alarmId = req.params.alarmId;
    
    alarmService.getAlarm(accountId, alarmId).then(alarm => {
        res.json({ alarm });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/:alarmId/dismiss', (req, res, next) => {
    let accountId = req.decodedToken.id
    let alarmId = req.params.alarmId;
    
    alarmService.dismissAlarm(accountId, alarmId).then(alarm => {
        res.json({ alarm });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});


router.get('/info/:alarmId', (req, res, next) => {
    
    let alarmId = req.params.alarmId;

    alarmService.getAlarmInfo(alarmId).then(info => {
        res.json(info);
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});


router.get('/info/file/names/:alarmId', (req, res, next) => {

    let alarmId = req.params.alarmId;

    alarmService.getProfileFiles(alarmId).then(files => {
        res.json({ files: files });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/info/file/:profileId/:file', (req, res, next) => {
    let profileId = req.params.profileId;
    let file = req.params.file;

    let filePath = path.join(__dirname, "../../../../uploads", profileId, file);
    res.sendFile(filePath)
});


router.post('/ap', (req, res, next) => {
    let deviceId = req.body.deviceId;
    let hmac = crypto.createHmac('sha256', config.hmacKey).update(deviceId).digest('hex');

    if (hmac != req.body.hmac) {
        res.status(400).send("invalid request");
        return;
    }

    alarmService.handleAlarm(req.body).then(alarms => {
        res.json({});
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;