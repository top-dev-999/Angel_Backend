const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    accountId: { type: String },
    number: { type: String },
    name: { type: String },
    email: { type: String }
}, { timestamps: true });

const Contact = (module.exports = mongoose.model('Contact', schema));

module.exports.findByIds = function (ids) {
    return Contact.find({ _id: { $in: ids } });
};

module.exports.findByAccountId = function (accountId) {
    return Contact.find({ accountId });
};