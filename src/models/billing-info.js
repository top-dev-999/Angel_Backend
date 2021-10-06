const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    accountId: { type: String }, 
    name: { type: String },
    surname: { type: String },
    cellphone: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    suburb: { type: String },
    province: { type: String },
    postalCode: { type: String },
}, { timestamps: true });

const BillingInfo = (module.exports = mongoose.model("BillingInfo", schema));

module.exports.findByAccountId = function (accountId) {
    return BillingInfo.findOne({ accountId });
};