const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    productIds: { type: [String] },
    accountId: { type: String },
    paymentStatus: { type: String },
    deliveryStatus: { type: String },
    amount: { type: Number },
}, { timestamps: true });

const Order = (module.exports = mongoose.model("Order", schema));

module.exports.findByAccountId = function (accountId) {
    return Order.find({ accountId });
};