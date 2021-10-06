const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    accountId: { type: String },
    name: { type: String },
    surname: { type: String },
    cellPhone: { type: String },
    email: { type: String },
    idNumber: { type: String },
    allergies: { type: String },
    comments: { type: String },
    auraPassword: { type: String },
}, { timestamps: true });

const Profile = (module.exports = mongoose.model("Profile", schema));

module.exports.findByAccountId = function (accountId) {
    return Profile.find({ accountId });
};