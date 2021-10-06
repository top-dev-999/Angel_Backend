const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    deviceId: { type: String },
    name: { type: String },
    longitude: { type: Number },
    latitude: { type: Number },
    message: { type: String },
    radius: { type: Number }
}, { timestamps: true });

const Region = (module.exports = mongoose.model('Region', schema));

module.exports.findByDeviceId = function(deviceId) {
    return Region.find({ deviceId });
}

module.exports.deleteByDeviceId = function (deviceId) {
    return Region.deleteMany({ deviceId });
}