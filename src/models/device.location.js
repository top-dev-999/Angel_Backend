const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    deviceId: { type: String },
    longitude: { type: Number },
    latitude: { type: Number },
}, { timestamps: true });

const DeviceLocation = (module.exports = mongoose.model("DeviceLocation", schema));

module.exports.findByDeviceId = function (deviceId) {
    return DeviceLocation.findOne({ deviceId });
};

module.exports.deleteByDeviceId = function (deviceId) {
    return DeviceLocation.deleteOne({ deviceId });
}