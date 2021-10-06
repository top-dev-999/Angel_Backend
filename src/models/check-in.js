const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    accountId: { type: String },
    profileId: { type: String },
    deviceMobileNumber: { type: String },
    deviceUnitId: { type: String },
    deviceName: { type: String },
    productId: { type: String },
    region: { type: String },
    wifi: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    message: { type: String },
    recipients: { type: String }
}, { timestamps: true });

const CheckIn = (module.exports = mongoose.model('CheckIn', schema));

module.exports.findByAccountId = function(accountId) {
    return CheckIn.find({ accountId });
}