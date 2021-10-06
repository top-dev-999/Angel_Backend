const express = require('express');
const router = express.Router({ mergeParams: true });

const ContactService = require('./contact-service');
const HttpUtil = require('../../../utilities/http-util');

// if we want to get fancy we can put these into a dependency injector
const contactService = new ContactService();

router.get('', (req, res, next) => {
    
    contactService.getContacts(req.decodedToken.id).then((contacts) => {
        res.json({ contacts });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:contactId', (req, res, next) => {

    contactService.getContact(req.decodedToken.id,  req.params.contactId).then((contact) => {
        res.json({ contact });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {
    let contact = {
        accountId: req.decodedToken.id,
        name: req.body.name,
        number: req.body.number,
        email: req.body.email,
    };
    
    contactService.createContact(contact).then((contact) => {
        res.json({ contact });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/update', (req, res, next) => {

    contactService.updateContact(req.decodedToken.id, req.body).then((contact) => {
        res.json({ contact });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/delete', (req, res, next) => {

    contactService.deleteContact(req.decodedToken.id, req.body).then(() => {
        res.json({});
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;