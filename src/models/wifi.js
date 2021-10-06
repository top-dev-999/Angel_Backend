const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    deviceId: { type: String },
    isSynced: { type: Boolean },
    longitude: { type: Number },
    latitude: { type: Number },
    ssid: { type: String },
    password: { type: String }
}, { timestamps: true });

const Wifi = (module.exports = mongoose.model("Wifi", schema));

module.exports.findByDeviceId = function (deviceId) {    
    return Wifi.findOne({ deviceId });
};

module.exports.deleteByDeviceId = function (deviceId) {
    return Wifi.deleteOne({ deviceId });
}