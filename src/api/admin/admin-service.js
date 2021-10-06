const Device = require('../../models/device');
const Communication = require('../../models/communication');
const dbMap = require('../../utilities/db-map');
const HttpUtil = require('../../utilities/http-util');

module.exports = class AdminService {

    constructor() { }

    async getAllDevices() {
        let dbDevices = await Device.findAll();
        return dbDevices.map(x => dbMap(x));
    }

    async getDevice(deviceId) {
        let device = await Device.findById(deviceId);
        return dbMap(device);
    }

    
    async getComms() {
        let comms = await Communication.findAll();
        comms = comms.reverse();
        return comms.map(x => dbMap(x));
    }
};