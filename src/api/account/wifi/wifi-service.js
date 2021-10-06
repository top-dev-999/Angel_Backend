const Device = require('../../../models/device');
const Wifi = require('../../../models/wifi');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class WifiService {

    constructor() {}

    async getWifiById(accountId, deviceId, wifiId) {
        let device = await Device.findById(deviceId);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid request'); }

        let wifi = await Wifi.findById(wifiId);
        return dbMap(wifi);
    }

    async createWifi(accountId, deviceId, wifiInput) {
        let device = await Device.findById(deviceId);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid request'); }

        let wifi = new Wifi(wifiInput);
        wifi.deviceId = deviceId;
        wifi.isSynced = false;
        await wifi.save();
        
        return dbMap(wifi);
    }

    async updateWifi(accountId, deviceId, wifiInput) {
    let device = await Device.findById(deviceId);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid request'); }

        let wifi = await Wifi.findById(wifiInput.id);
        if (wifi.ssid != wifiInput.ssid || wifi.password != wifiInput.password) {
            wifi.ssid = wifiInput.ssid;
            wifi.password = wifiInput.password;
            wifi.isSynced = false;
        }
        wifi.latitude = wifiInput.latitude;
        wifi.longitude = wifiInput.longitude;
        await wifi.save();

        return dbMap(wifi);
    }

    async deleteWifi(accountId, deviceId, wifi) {
        let device = await Device.findById(deviceId);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid request'); }

        return await Wifi.findByIdAndDelete(wifi.id);
    }

};