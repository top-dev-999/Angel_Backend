const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    productId: { type: String },
    accountId: { type: String },
    orderId: { type: String },
    status: { type: String },
}, { timestamps: true });

const Subscription = (module.exports = mongoose.model("Subscription", schema));

module.exports.findByIds = function (ids) {
    return Subscription.find({ _id: { $in: ids } });
};

module.exports.findByAccountId = function (accountId) {
    return Subscription.find({ accountId });
};

module.exports.findByOrderId = function (orderId) {
    return Subscription.find({ orderId });
};