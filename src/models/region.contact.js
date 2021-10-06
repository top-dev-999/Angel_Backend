const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    contactId: { type: String },
    regionId: { type: String }
}, { timestamps: true });

const RegionContact = (module.exports = mongoose.model('RegionContact', schema));

module.exports.findByRegionId = function (regionId) {
    return RegionContact.find({ regionId });
};

module.exports.deleteByRegionId = function (regionId) {
    return RegionContact.deleteMany({ regionId });
};
module.exports.deleteByContactId = function (contactId) {
    return RegionContact.deleteMany({ contactId });
};