const BillingInfo = require('../../../models/billing-info');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class BillingsInfoService {

    constructor() { }

    async getBillingInfo(accountId) {
        let billingInfo = await BillingInfo.findByAccountId(accountId);
        if (billingInfo) {
            return dbMap(billingInfo);
        }
        return null;
    }

    async createBillingInfo(accountId, billingInfoInput) {

        let billingInfo = new BillingInfo({
            accountId: accountId, 
            name: billingInfoInput.name,
            surname: billingInfoInput.surname,
            cellphone: billingInfoInput.cellphone,
            addressLine1: billingInfoInput.addressLine1,
            addressLine2: billingInfoInput.addressLine2,
            suburb: billingInfoInput.suburb,
            province: billingInfoInput.province,
            postalCode: billingInfoInput.postalCode
        });
        await billingInfo.save();

        return dbMap(billingInfo);
    }

    async updateBillingInfo(accountId, billingInfoInput) {

        let billingInfo = await BillingInfo.findById(billingInfoInput.id);
        if (!billingInfo || billingInfo.accountId != accountId) {
            HttpUtil.throw400Error('Invalid Request');
        }

        billingInfo.name = billingInfoInput.name;
        billingInfo.surname = billingInfoInput.surname;
        billingInfo.cellphone = billingInfoInput.cellphone;
        billingInfo.addressLine1 = billingInfoInput.addressLine1;
        billingInfo.addressLine2 = billingInfoInput.addressLine2;
        billingInfo.suburb = billingInfoInput.suburb;
        billingInfo.province = billingInfoInput.province;
        billingInfo.postalCode = billingInfoInput.postalCode;
        await billingInfo.save();

        return dbMap(billingInfo);
    }
};