const Account = require("../../models/account");
const Profile = require("../../models/profile");
const Device = require("../../models/device");
const DeviceLocation = require("../../models/device.location");
const Region = require("../../models/region");
const Contact = require("../../models/contact");
const RegionContact = require("../../models/region.contact");
const DeviceContact = require("../../models/device.contact");
const Communication = require("../../models/communication");

const alarmManager = require("../../alarm-manager/alarm-manger");
const distance = require("../../utilities/distance");
const locationUtil = require("../../utilities/location-util");
const dbMap = require("../../utilities/db-map");
const io = require("../../socket/websocket");

module.exports = class MessageService {
  constructor() {}

  async handleMessage(message, source) {
    this.saveCommunication(message, source);

    let fromNumber = this.getNumberInDbFormat(message.fromNumber);

    let device = await Device.findByMobileNumber(fromNumber);
    if (!device) {
      return "No device matched that number";
    }

    //let messageParts = message.text.split('\n').filter(n => n);
    let messageText = message.text;
    messageText = messageText
.replace(/BATTERY=,35-/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/BATTERY=,36-/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/BATTERY=,37-/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/BATTERY=,38-/g,  "http%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/BATTERY=,34-/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
     .replace(/%0ABATTERY%3D%2C36-/g, "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
      .replace(/%0ABATTERY%3D%2C37-/g, "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
      .replace(/%0ABATTERY%3D%2C35-/g, "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
      .replace(/%0ABATTERY%3D%2C34-/g, "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
      .replace(/%0ABATTERY%3D%2C33-/g, "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
      .replace(/%0ABATTERY%3D%2C38-/g, "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")

.replace(/nBATTERY%3D%2C34-\n/g, "http://maps.google.com/maps?q=25%2058.8763S%20028")
.replace(/nBATTERY%3D%2C35-\n/g, "http://maps.google.com/maps?q=25%2058.8763S%20028")
.replace(/nBATTERY%3D%2C36-\n/g, "http://maps.google.com/maps?q=25%2058.8763S%20028")
.replace(/nBATTERY%3D%2C37-\n/g, "http://maps.google.com/maps?q=25%2058.8763S%20028")
.replace(/nBATTERY%3D%2C38-\n/g, "http://maps.google.com/maps?q=25%2058.8763S%20028")

.replace(/nBATTERY%3D%2C38-\n/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/nBATTERY%3D%2C37-\n/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/nBATTERY%3D%2C36-\n/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/nBATTERY%3D%2C35-\n/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")
.replace(/nBATTERY%3D%2C34-\n/g,  "%0Ahttp%3A%2F%2Fmaps.google.com%2Fmaps%3Fq%3D42%252058.8267N%2520070%252058.5743W%0A")



      .replace(/%0A/g, "\n")
      .replace("%3A", ":")
      .replace(/%2F/g, "/")
      .replace(/%25/g, "%")
      .replace("%3F", "?")
      .replace("%3D", "=")
      .replace(/CC/g, "AA")
      .replace(/STORAGE/g, "HELP")
      .replace(/UNIT/g, "L")
      .replace(/ALARM-/g, "%C9%2C38")
      
    let messageParts = messageText.split("\n").filter((n) => n);
    console.log(messageText);

    if (messageParts.length != 2) {
      return "Invalid message";
    }

    let messageInfo = messageParts[0].split("-");
    let messageType = messageInfo[1];
    let messageLocation = messageParts[1];
    let location = locationUtil.getLatLongFromMapUrl(messageLocation);

    if (messageType == "TEST") {
      device.isSynced = true;
      await device.save();
      return "Device Synced";
    } else if (
      messageType == "HELP" ||
      messageType == "INPACT" ||
      messageType == "IMPACT" ||
      messageType == "CHECK"
    ) {
      let account = await Account.findById(device.accountId);
      let profile = await Profile.findById(device.profileId);
      let deviceRegions = await Region.findByDeviceId(device.id);
      let region = this.getRegion(location, deviceRegions);
      let contacts = await this.getContacts(device, region);

      let messageData = {
        device: device,
        account: account,
        profile: profile,
        region: region,
        contacts: contacts,
        location: location,
        impactLevel:
          messageType == "INPACT" || messageType == "IMPACT"
            ? messageInfo[2]
            : null,
        locationType: messageInfo[messageInfo.length - 1],
      };

      console.log(JSON.stringify(messageData));

      if (messageType == "CHECK") {
        await alarmManager.handleMessageCheckIn(messageData);
        return "CheckIn complete";
      } else {
        await alarmManager.handleMessageAlarm(messageData);
        return "Alarm raised";
      }
    }

    return "unknown request";
  }

  async saveCommunication(message, source) {
    let communication = new Communication({
      source: source,
      from: message.fromNumber,
      received: JSON.stringify(message, undefined, 4),
    });
    await communication.save();
    io.emit("comm", dbMap(communication));
  }

  getNumberInDbFormat(number) {
    if (number.substring(0, 1) == "0") {
      return "+27" + number.substring(1);
    }

    if (number.substring(0, 2) == "27") {
      return "+" + number;
    }

    if (number.substring(0, 3) == "+27") {
      return number;
    }

    return "+" + number;
  }

  getRegion(location, regions) {
    for (let i in regions) {
      let region = regions[i];
      if (!region.isDefault) {
        let distanceToRegion = distance.meters(
          region.latitude,
          region.longitude,
          location.latitude,
          location.longitude
        );
        if (distanceToRegion < region.radius) {
          return region;
        }
      }
    }

    return null;
  }

  async getContacts(device, region) {
    let contactIds = [];
    if (region) {
      let regionContacts = await RegionContact.findByRegionId(region.id);
      contactIds = regionContacts.map((x) => x.contactId);
    } else {
      let deviceContacts = await DeviceContact.findByDeviceId(device.id);
      contactIds = deviceContacts.map((x) => x.contactId);
    }

    let contacts = await Contact.findByIds(contactIds);
    return contacts;
  }

  async handleRingingUnit(incomingNumber, source) {
    this.saveCommunication(incomingNumber, source);

    let device = await Device.findByMobileNumber(incomingNumber);
    if (!device) {
      return "No device matched that number";
    }

    let account = await Account.findById(device.accountId);
    let profile = await Profile.findById(device.profileId);
    let location = await DeviceLocation.findByDeviceId(device.id);
    let contacts = await this.getContacts(device);

    let messageData = {
      device,
      account,
      profile,
      location,
      contacts,
    };

    console.log(JSON.stringify(messageData));

    await alarmManager.handleMessageAlarm(messageData);
  }
};
