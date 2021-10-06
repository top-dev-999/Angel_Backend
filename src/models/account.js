const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema({
    email: { type: String },
    role: { type: String },
    password: { type: String }
}, { timestamps: true });

const Account = (module.exports = mongoose.model("Account", schema));

module.exports.findByEmail = function (email) {
    return Account.findOne({ email });
};

module.exports.create = async function (account) {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(account.password, salt);
    account.password = hash;

    let dbAccount = new Account(account);
    await dbAccount.save();
    
    return dbAccount;
};

module.exports.updatePassword = async function (account, newPassword) {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(newPassword, salt);

    account.password = hash;
    await account.save();

    return account;
};