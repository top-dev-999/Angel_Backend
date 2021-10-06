const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    profileId: { type: String },
    file: { type: String }
}, { timestamps: true });

const ProfileFile = (module.exports = mongoose.model("ProfileFile", schema));

module.exports.findByProfileId = function (profileId) {
    return ProfileFile.find({ profileId });
};