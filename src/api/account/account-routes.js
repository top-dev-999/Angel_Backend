const express = require('express');
const router = express.Router({ mergeParams: true });

const AccountService = require('./account-service');
const ValidationService = require('../../utilities/validation/validation-service');
const HttpUtil = require('../../utilities/http-util');

const profileRoutes = require('./profile/profile-routes');
const deviceRoutes = require('./device/device-routes');
const alarmRoutes = require('./alarm/alarm-routes');
const checkInRoutes = require('./check-in/check-in-routes');
const contactRoutes = require('./contact/contact-routes');
const billingInfoRoutes = require('./billing-info/billing-info-routes');
const subscriptionRoutes = require('./subscription/subscription-routes');
const invoiceRoutes = require('./invoice/invoice-routes');

// if we want to get fancy we can put these into a dependency injector
const accountService = new AccountService();
const validationService = new ValidationService();

router.use('/profile', profileRoutes);
router.use('/device', deviceRoutes);
router.use('/alarm', alarmRoutes);
router.use('/check-in', checkInRoutes);
router.use('/contact', contactRoutes);
router.use('/billing-info', billingInfoRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/invoice', invoiceRoutes);

router.post('/update-password', (req, res, next) => {
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;

    if (!validationService.isValidPassword(newPassword)) {
        return res.status(400).send('your current password is invalid');
    }

    accountService.updatePassword(req.decodedToken, currentPassword, newPassword).then(message => {
        res.json({ msg: message });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

module.exports = router;