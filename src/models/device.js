const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    mobileNumber: { type: String },
    unitId: { type: String },
    accountId: { type: String },
    profileId: { type: String },
    productId: { type: String },
    subscriptionId: { type: String },
    name: { type: String },
    message: { type: String },
    state: { type: String },
    stateHistory: { type: Array },
}, { timestamps: true });

const Device = (module.exports = mongoose.model("Device", schema));

module.exports.findAll = function () {
    return Device.find({});
};

module.exports.findByAccountId = function (accountId) {    
    return Device.find({ accountId });
};

module.exports.findByMobileNumber = function (mobileNumber) {
    return Device.findOne({ mobileNumber });
};

module.exports.findByUnitId = function (unitId) {
    return Device.findOne({ unitId });
};