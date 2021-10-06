const Contact = require('../../../models/contact');
const DeviceContact = require('../../../models/device.contact');
const RegionContact = require('../../../models/region.contact');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class ContactService {

    constructor() {}
    
    async getContacts(accountId) {
        let contacts = await Contact.findByAccountId(accountId);
        return contacts.map(x => dbMap(x));
    }

    async getContact(accountId, contactId) {
        let contact = await Contact.findById(contactId);
        if (contact.accountId != accountId) {
            HttpUtil.throw400Error('Invalid request');
        }
        return dbMap(contact);
    }

    async createContact(contact) {
        let dbContact = new Contact(contact);
        await dbContact.save();
        return dbMap(dbContact);
    }

    async updateContact(accountId, contactInput) {
        let contact = await Contact.findById(contactInput.id);
        if (contact.accountId != accountId) {
            HttpUtil.throw400Error('Invalid request');
        }
        
        contact.number = contactInput.number;
        contact.name = contactInput.name;
        contact.email = contactInput.email;
        await contact.save();

        return dbMap(contact);
    }

    async deleteContact(accountId, contactInput) {
        let contact = await Contact.findById(contactInput.id);
        if (contact.accountId != accountId) {
            HttpUtil.throw400Error('Invalid request');
        }

        await DeviceContact.deleteByDeviceId(contact.id);
        await RegionContact.deleteByRegionId(contact.id);

        return await Contact.findByIdAndDelete(contact.id);
    }
};