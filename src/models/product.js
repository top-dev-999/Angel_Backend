const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: { type: String },
    imagePath: { type: String },
    mode: { type: String },
    price: { type: Number },
    monthlyPrice: { type: Number },
    yearlyPrice: { type: Number }
}, { timestamps: true });

const Product = (module.exports = mongoose.model("Product", schema));

module.exports.findByIds = function (ids) {
    return Product.find({ _id: { $in: ids } });
};