const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    orderId: { type: String },
    subscriptionIds: { type: [String] },
    accountId: { type: String },
    payfastId: { type: String },
    amount: { type: Number },
    payfastJson: { type: String }
}, { timestamps: true });

const Payment = (module.exports = mongoose.model("Payment", schema));

module.exports.findByAccountId = function (accountId) {
    return Invoice.find({ accountId });
};

module.exports.findByOrderId = function (orderId) {
    return Payment.find({ orderId });
};

module.exports.findBySubscriptionId = function (subscriptionId) {
    return Payment.find({ subscriptionId });
};