const express = require('express');
const router = express.Router({ mergeParams: true });

const ProfileService = require('./profile-service');
const HttpUtil = require('../../../utilities/http-util');

const multer = require('multer');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

// if we want to get fancy we can put these into a dependancy injector
const profileService = new ProfileService();

router.get('', (req, res, next) => {
    let accountId = req.decodedToken.id;

    profileService.getAccountProfiles(accountId).then(profiles => {
        res.json({ profiles: profiles });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:profileId', (req, res, next) => {
    let profileId = req.params.profileId;
    let accountId = req.decodedToken.id;

    profileService.getProfile(accountId, profileId).then(profile => {
        res.json({ profile: profile });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {
    let accountId = req.decodedToken.id;

    profileService.createProfile(accountId, req.body).then(profile => {
        res.json({ profile: profile });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/:profileId', (req, res, next) => {
    let profileId = req.params.profileId;
    let accountId = req.decodedToken.id;

    profileService.updateProfile(accountId, profileId, req.body).then(profile => {
        res.json({ profile: profile });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});


// file uploads
router.post('/file/upload/:profileId', (req, res, next) => {
    let profileId = req.params.profileId;

    mkdirp('./uploads/' + profileId, (err) => {
        if (err) { return HttpUtil.handleError(err, res); }

        let storage = multer.diskStorage({
            destination: function (req, file, cb) {;
                cb(null, './uploads/' + profileId)
            },
            filename: function (req, file, cb) {
                let index = file.originalname.lastIndexOf('.');
                let extension = index > 0 ? file.originalname.substr(index) : '';
                let fileName = Date.now() + extension;
                cb(null, fileName)
            }
        });

        let upload = multer({ storage: storage }).single('file');
        upload(req, res, (err) => {
            if (err) { return HttpUtil.handleError(err, res); }

            profileService.createProfileFile(profileId, req.file.filename).then(file => {
                res.json({ file: file });
            }).catch(err => {
                HttpUtil.handleError(err, res);
            });
        });
    });
});

router.get('/file/names/:profileId', (req, res, next) => {
    let accountId = req.decodedToken.id;
    let profileId = req.params.profileId;

    profileService.getProfileFiles(profileId).then(files => {
        res.json({ files: files });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/file/:profileId/:file', (req, res, next) => {
    let file = req.params.file;
    let profileId = req.params.profileId;
    let filePath = path.join(__dirname, "../../../../uploads", profileId, file);
    res.sendFile(filePath)
});

router.post('/file/delete', (req, res, next) => {
    let file = req.body.file
    let profileId = req.body.profileId;
    let filePath = path.join(__dirname, "../../../../uploads", profileId, file);
    try {
        fs.unlinkSync(filePath);
    } catch (err) {
        HttpUtil.handleError(err, res);
    }

    profileService.deleteProfileFile(req.body.id).then(none => {
        res.json({ success: true })
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;