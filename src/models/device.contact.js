const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    contactId: { type: String },
    deviceId: { type: String }
}, { timestamps: true });

const DeviceContact = (module.exports = mongoose.model('DeviceContact', schema));

module.exports.findByDeviceId = function (deviceId) {
    return DeviceContact.find({ deviceId });
};

module.exports.deleteByDeviceId = function (deviceId) {
    return DeviceContact.deleteMany({ deviceId });
};
module.exports.deleteByContactId = function (contactId) {
    return DeviceContact.deleteMany({ contactId });
};