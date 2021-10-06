const Contact = require('../../../models/contact');
const RegionContact = require('../../../models/region.contact');
const Device = require('../../../models/device');
const Region = require('../../../models/region');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class RegionService {

    constructor() { }

    async getById(accountId, deviceId, regionId) {
        let device = await Device.findById(deviceId);
        if (device.accountId != accountId) { HttpUtil.throw400Error('Invalid device'); }

        let dbRegion = await Region.findById(regionId);
        let region = dbMap(dbRegion);

        region.contacts = this.getRegionContacts(region.id);
        return region
    }

    async getRegionContacts(regionId) {
        let regionContacts = await RegionContact.findByRegionId(regionId);
        let contactIds = regionContacts.map(x => x.contactId);

        let contacts = await Contact.findByIds(contactIds);
        return contacts.map(x => dbMap(x));
    }


    async createRegion(deviceId, regionInput) {

        let region = new Region(regionInput);
        region.deviceId = deviceId;
        await region.save();

        this.saveRegionContacts(region, regionInput.contacts);

        let res = dbMap(region);
        res.contacts = regionInput.contacts;
        return res;
    }

    async saveRegionContacts(region, contacts) {

        let regionContacts = await RegionContact.findByRegionId(region.id);

        // add new contacts
        for (let i in contacts) {
            let contact = contacts[i];

            let existing = regionContacts.filter(x => x.contactId == contact.id)[0];
            if (!existing) {
                let regionContact = new RegionContact({
                    contactId: contact.id,
                    regionId: region.id
                });
                await regionContact.save();
            }
        }

        /// remove device contacts not in contacts
        for (let i in regionContacts) {
            let regionContact = regionContacts[i];

            let existing = contacts.filter(x => x.id == regionContact.contactId)[0];
            if (!existing) {
                await RegionContact.findByIdAndRemove(regionContact.id);
            }
        }
    }

    async updateRegion(regionInput) {
        let region = await Region.findById(regionInput.id);
        region.name = regionInput.name;
        region.longitude = regionInput.longitude;
        region.latitude = regionInput.latitude;
        region.radius = regionInput.radius;
        region.message = regionInput.message;
        await region.save();

        this.saveRegionContacts(region, regionInput.contacts);

        let res = dbMap(region);
        res.contacts = regionInput.contacts;
        return res;
    }

    async deleteRegion(regionId) {
        await RegionContact.deleteByRegionId(regionId);
        return await Region.findByIdAndDelete(regionId);
    }

};