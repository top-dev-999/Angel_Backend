const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    source: { type: String },
    from: { type: String },
    received: { type: String },
    response: { type: String }
}, { timestamps: true });

const Communication = (module.exports = mongoose.model('Communication', schema));

module.exports.findAll = function() {
    return Communication.find({}).sort({ createdAt: 'desc' }).limit(100).exec();
}