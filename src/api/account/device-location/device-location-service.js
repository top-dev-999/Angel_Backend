const Device = require('../../../models/device');
const DeviceLocation = require('../../../models/device.location');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class DeviceLocationService {

    constructor() {}

    async createOrUpdateLocation(accountId, locationInput) {
        let device = await Device.findById(locationInput.deviceId);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid request'); }

        let location;
        if (locationInput.id) {
            location = await DeviceLocation.findById(locationInput.id);
        } else {
            location = new DeviceLocation();
        }

        location.deviceId = locationInput.deviceId;
        location.latitude = locationInput.latitude;
        location.longitude = locationInput.longitude;
        await location.save();

        return dbMap(location);
    }
};
