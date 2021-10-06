const SmsUtil = require('../utilities/sms/sms-util');
const AuraService = require('../aura/aura-service');

const Device = require('../models/device');
const Account = require('../models/account');
const Profile = require('../models/profile');
const Wifi = require('../models/wifi');
const DeviceContact = require('../models/device.contact');
const Contact = require('../models/contact');
const Alarm = require('../models/alarm');
const CheckIn = require('../models/check-in');

exports.handleWifiAlarm = async function (unitId) {
    let data = await getWifiAlarmData(unitId);
    return await raiseAlarm(data);
};

const getWifiAlarmData = async function (unitId) {

    let device = await Device.findByUnitId(unitId);
    if (!device) { return null; }
    let account = await Account.findById(device.accountId);
    let profile = await Profile.findById(device.profileId);
    let wifi = await Wifi.findByDeviceId(device.id);
    if (!wifi) { return null; }
    let deviceContacts = await DeviceContact.findByDeviceId(device.id);
    let contacts = await Contact.findByIds(deviceContacts.map(x => x.contactId));

    return {
        device: device,
        account: account,
        profile: profile,
        wifi: wifi,
        contacts: contacts,
        location: {
            latitude: wifi.latitude,
            longitude: wifi.longitude
        }
    };
}


exports.handleTcpAlarm = async function (tcpData) {
    let alarmData = await getTcpAlarmData(tcpData);
    return await raiseAlarm(alarmData);
};

const getTcpAlarmData = async function (data) {

    let device = await Device.findByUnitId(data.unitId);
    if (!device) { return null; }
    let account = await Account.findById(device.accountId);
    let profile = await Profile.findById(device.profileId);
    let deviceContacts = await DeviceContact.findByDeviceId(device.id);
    let contacts = await Contact.findByIds(deviceContacts.map(x => x.contactId));

    return {
        device: device,
        account: account,
        profile: profile,
        impactLevel: data.impactLevel,
        contacts: contacts,
        location: data.location
    };
}


exports.handleMessageAlarm = async function (data) {
    return await raiseAlarm(data);
};


const raiseAlarm = async function (data) {
    if (!data || !data.contacts.length || data.device.state == 'disarmed') { return; }

    let alarm = await createAlarm(data);
    let message = buildAlarmMessage(data, alarm.id);
    alarm.message = message;
    await alarm.save();

    let numbers = data.contacts.map(x => x.number);
    SmsUtil.sendOneWayMessage(message, numbers);

    try {
        await AuraService.createCallOut(data.profile, alarm);
    } catch(err) {
        console.log(err);
    }

    return alarm;
}

const createAlarm = async (data) => {
    let alarm = new Alarm({
        accountId: data.account.id,
        profileId: data.profile.id,
        deviceMobileNumber: data.device.mobileNumber,
        deviceUnitId: data.device.unitId,
        deviceName: data.device.name,
        productId: data.device.productId,
        region: data.region ? data.region.name : null,
        wifi: data.wifi ? data.wifi.ssid : null,
        latitude: data.location ? data.location.latitude : null,
        longitude: data.location ? data.location.longitude : null,
        message: '',
        recipients: JSON.stringify(data.contacts.map(x => { return { name: x.name, number: x.number }; })),
    });
    await alarm.save();
    return alarm;
};

const buildAlarmMessage = function (data, alarmId) {

    let profileName = `${data.profile.name} ${data.profile.surname}`;
    let deviceName = data.device.name;
    let typeText = `${profileName} has raised on alarm on their ${deviceName} device.`;
    if (data.impactLevel || data.impactLevel == '') {
        let impact = '';
        switch (data.impactLevel) {
            case '':
            case '0': impact = 'minor'; break;
            case '1': impact = 'small'; break;
            case '2': impact = 'medium'; break;
            case '3': impact = 'serious'; break;
        }
        typeText = `A ${impact} impact has been detected on ${profileName}'s ${deviceName} device.`;
    }

    let locationStart = data.locationType == 'L' ? 'Last known location: ' : 'Current location: ';
    let locationText = locationStart + getGoogleMapUrlFromLocation(data.location);
    let timeText = `Time of alarm: ${formatDate(new Date())}.`;
    let customMessage = data.device.message ? `${data.profile.name} says: ${data.device.message}` : '';
    let link = `https://devices.angelaspirations.com/alarm/info/${alarmId}`;
    let voltageText = `Battery Voltage: 3.6v`;
    let regionText = data.region.name;
    let message = `${typeText}\r\n${locationText}\r\n${regionText}\r\n${timeText}\r\n${link}\r\n${voltageText}\r\n${customMessage}`;
    return message;
};

const getGoogleMapUrlFromLocation = function (location) {
    if (location) {
        return ('http://maps.google.com/maps?q=' + location.latitude + '%2C' + location.longitude + '.');
    }
    return '';
};

const formatDate = function (date) {
    return date.getFullYear() + '/' +
        twoDigitString(date.getMonth() + 1) + '/' +
        twoDigitString(date.getDate()) + ' ' +
        twoDigitString(date.getHours()) + ':' +
        twoDigitString(date.getMinutes());
};

const twoDigitString = function (digit) {
    if (digit < 10) {
        return '0' + digit;
    }
    return digit + '';
}


exports.handleMessageCheckIn = async function (data) {
    return await checkIn(data);
};

const checkIn = async function (data) {
    if (!data.contacts || !data.contacts.length) { return; }

    let message = buildCheckInMessage(data);
    let checkIn = await createCheckIn(data, message);
    let numbers = data.contacts.map(x => x.number);
    SmsUtil.sendOneWayMessage(message, numbers);

    return checkIn;
}

const buildCheckInMessage = function (data) {

    let profileName = `${data.profile.name} ${data.profile.surname}`;
    let deviceName = data.device.name;
    let typeText = `${profileName} has checked in with their ${deviceName} device.`;
    let locationStart = data.locationType == 'L' ? 'Last known location: ' : 'Current location: ';
    let locationText = locationStart + getGoogleMapUrlFromLocation(data.location);
    let timeText = `Check in time: ${formatDate(new Date())}.`;

    let message = `${typeText}\r\n${locationText}\r\n${timeText}`;
    return message;
};

const createCheckIn = async (data, message) => {
    let checkIn = new CheckIn({
        accountId: data.account.id,
        profileId: data.profile.id,
        deviceMobileNumber: data.device.mobileNumber,
        deviceUnitId: data.device.unitId,
        deviceName: data.device.name,
        productId: data.device.productId,
        region: data.region ? data.region.name : null,
        wifi: data.wifi ? data.wifi.ssid : null,
        latitude: data.location ? data.location.latitude : null,
        longitude: data.location ? data.location.longitude : null,
        message: message,
        recipients: JSON.stringify(data.contacts.map(x => { return { name: x.name, number: x.number }; })),
    });
    await checkIn.save();
    return checkIn;
};


exports.buildStateMessage = function (profile, device, state) {

    let profileName = `${profile.name} ${profile.surname}`;
    let deviceName = device.name;
    let typeText = `${profileName} has ${state} their ${deviceName} device.`;
    let timeText = `Time: ${formatDate(new Date())}.`;
    let voltageText = `Battery Voltage: 3.6v`
    let message = `${typeText}\r\n${timeText}\r\n${voltageText}`;
    return message;
};
