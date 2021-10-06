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
    recipients: { type: String },
    auraCallOutId: { type: String },
}, { timestamps: true });

const Alarm = (module.exports = mongoose.model('Alarm', schema));

module.exports.findByAccountId = function(accountId) {
    return Alarm.find({ accountId });
}