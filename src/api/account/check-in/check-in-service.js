const CheckIn = require('../../../models/check-in');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class CheckInService {

    constructor() { }

    async getCheckIns(accountId) {
        let checkIns = await CheckIn.findByAccountId(accountId);
        return checkIns.map(x => dbMap(x));
    }

    async getCheckIn(accountId, checkInId) {
        let checkIn = await CheckIn.findById(checkInId);
        if (!checkIn || checkIn.accountId != accountId) {
            HttpUtil.throw400Error('Invalid request');
        }
        return dbMap(checkIn);
    }
};