const Account = require('../../../models/account');
const Device = require('../../../models/device');
const Region = require('../../../models/region');
const Wifi = require('../../../models/wifi');
const DeviceLocation = require('../../../models/device.location'); 
const Product = require('../../../models/product');
const DeviceContact = require('../../../models/device.contact');
const RegionContact = require('../../../models/region.contact');
const Contact = require('../../../models/contact');
const Profile = require('../../../models/profile');
const alarmManager = require('../../../alarm-manager/alarm-manger');

const SmsUtil = require('../../../utilities/sms/sms-util');
const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class DeviceService {

    constructor() { }

    async getAccountDevices(accountId) {
        let devices = await Device.findByAccountId(accountId);
        return devices.map(x => dbMap(x));
    }

    async getDevice(accountId, deviceId) {
        let dbDevice = await Device.findById(deviceId);
        let device = dbMap(dbDevice);
        if (device.accountId != accountId) { HttpUtil.throw400Error('This device does not belong to you'); }

        let product = await Product.findById(device.productId);
        device.product = dbMap(product);
        device.contacts = await this.getDeviceContacts(deviceId);
        device.regions = await this.getDeviceRegions(deviceId);
        device.wifi = await this.getDeviceWifi(deviceId);
        device.location = await this.getDeviceLocation(deviceId);

        return device;
    }

    async getDeviceContacts(deviceId) {
        let deviceContacts = await DeviceContact.findByDeviceId(deviceId);
        let contactIds = deviceContacts.map(x => x.contactId);

        let contacts = await Contact.findByIds(contactIds);
        return contacts.map(x => dbMap(x));
    }

    async getDeviceRegions(deviceId) {
        let dbRegions = await Region.findByDeviceId(deviceId);
        let regions = dbRegions.map(x => dbMap(x));

        for (let i in regions) {
            let region = regions[i];

            region.contacts = await this.getRegionContacts(region.id);
        }

        return regions;
    }

    async getRegionContacts(regionId) {
        let regionContacts = await RegionContact.findByRegionId(regionId);
        let contactIds = regionContacts.map(x => x.contactId);

        let contacts = await Contact.findByIds(contactIds);
        return contacts.map(x => dbMap(x));
    }

    async getDeviceWifi(deviceId) {
        let wifi = await Wifi.findByDeviceId(deviceId);
        if (wifi) { return dbMap(wifi); }
        return null;
    }

    async getDeviceLocation(deviceId) {
        let location = await DeviceLocation.findByDeviceId(deviceId);
        if (location) { return dbMap(location); }
        return null;
    }
    


    async createDevice(accountId, deviceInput) {
        await this.handleExistingDevice(deviceInput);

        let device = new Device(deviceInput);
        device.accountId = accountId;
        await device.save();

        await this.saveDeviceContacts(device, deviceInput.contacts);
        this.sendMessageToDevice(device);

        return dbMap(device);
    }

    async handleExistingDevice(deviceInput) {
        if (deviceInput.mobileNumber) {
            let existingDevice = await Device.findByMobileNumber(deviceInput.mobileNumber);
            if (existingDevice) {
                HttpUtil.throw400Error(`A device with that mobile number already exists`);
            }
        }

        if (deviceInput.unitId) {
            let existingDevice = await Device.findByUnitId(deviceInput.unitId);
            if (existingDevice) {
                HttpUtil.throw400Error(`A device with that unit ID already exists`);
            }
        }
    }

    async saveDeviceContacts(device, contacts) {

        let deviceContacts = await DeviceContact.findByDeviceId(device.id);

        // add new contacts
        for (let i in contacts) {
            let contact = contacts[i];

            let existing = deviceContacts.filter(x => x.contactId == contact.id)[0];
            if (!existing) {
                let deviceContact = new DeviceContact({
                    contactId: contact.id,
                    deviceId: device.id
                });
                await deviceContact.save();
            }
        }

        /// remove device contacts not in contacts
        for (let i in deviceContacts) {
            let deviceContact = deviceContacts[i];

            let existing = contacts.filter(x => x.id == deviceContact.contactId)[0];
            if (!existing) {
                await DeviceContact.findByIdAndRemove(deviceContact.id);
            }
        }
    }

    sendMessageToDevice(device) {
        if (!device.mobileNumber) { return; }
        SmsUtil.sendTwoWayMessage('The angel aspirations server says hello', device.mobileNumber);
    }

    async setupDevice(accountId, deviceInput) {
        let device = await Device.findById(deviceInput.id);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid device'); }

        await this.handleExistingDevice(deviceInput);

        device.name = deviceInput.name;
        device.mobileNumber = deviceInput.mobileNumber;
        device.unitId = deviceInput.unitId;
        device.profileId = deviceInput.profileId;
        device.message = deviceInput.message;
        this.sendMessageToDevice(device);

        await device.save();
        await this.saveDeviceContacts(device, deviceInput.contacts);

        return dbMap(device);
    }

    async updateDevice(accountId, deviceInput) {
        let device = await Device.findById(deviceInput.id);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid device'); }

        device.name = deviceInput.name;
        device.profileId = deviceInput.profileId;
        device.message = deviceInput.message;
        if (device.mobileNumber != deviceInput.mobileNumber) {
            device.mobileNumber = deviceInput.mobileNumber;
            this.sendMessageToDevice(device);
        }
        await device.save();

        await this.saveDeviceContacts(device, deviceInput.contacts);

        let res = dbMap(device);
        res.contacts = deviceInput.contacts;
        return res;
    }

    async updateDeviceState(accountId, stateInput) {
        let device = await Device.findById(stateInput.deviceId);
        if (stateInput.state != 'armed' && stateInput.state != 'disarmed') { HttpUtil.throw400Error('Invalid state'); }
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid device'); }

        device.state = stateInput.state;
        if (!device.stateHistory) { device.stateHistory = []; }
        device.stateHistory.push({ state: stateInput.state, date: new Date() });
        await device.save();

        let profile = await Profile.findById(device.profileId);
        if (profile.cellPhone) {
            let message = alarmManager.buildStateMessage(profile, device, stateInput.state);
            SmsUtil.sendOneWayMessage(message, [profile.cellPhone]);
        }

        return dbMap(device);
    }

    async deleteDevice(accountId, deviceInput) {
        let device = await Device.findById(deviceInput.id);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid device'); }

        let regions = await Region.findByDeviceId(device.id);
        for (let i in regions) {
            let region = regions[i];
            await RegionContact.deleteByRegionId(region.id);
        }
        await DeviceContact.deleteByDeviceId(device.id);
        await Region.deleteByDeviceId(device.id);
        await Wifi.deleteByDeviceId(device.id);
        await DeviceLocation.deleteByDeviceId(device.id);

        return await Device.findByIdAndDelete(device.id);
    }
};