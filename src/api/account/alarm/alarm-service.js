const Alarm = require('../../../models/alarm');
const Account = require('../../../models/account');
const Profile = require('../../../models/profile');
const Device = require('../../../models/device');
const Region = require('../../../models/region');
const Contact = require('../../../models/contact');
const alarmManager = require('../../../alarm-manager/alarm-manger');
const distance = require('../../../utilities/distance');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

const ProfileService = require('../profile/profile-service');
const AuraService = require('../../../aura/aura-service');

const profileService = new ProfileService();

module.exports = class AlarmService {

    constructor() { }

    async getAlarms(accountId) {
        let alarms = await Alarm.findByAccountId(accountId);
        return alarms.map(x => dbMap(x));
    }

    async getAlarm(accountId, alarmId) {
        let alarm = await Alarm.findById(alarmId);
        if (!alarm || alarm.accountId != accountId) {
            HttpUtil.throw400Error('Invalid request');
        }
        let aura = await AuraService.getCallOutStatus(alarm);
        let res = dbMap(alarm);
        res.aura = aura;
        return res;
    }

    async dismissAlarm(accountId, alarmId) {
        let alarm = await Alarm.findById(alarmId);
        if (!alarm || alarm.accountId != accountId) {
            HttpUtil.throw400Error('Invalid request');
        }
        await AuraService.dismissCallOut(alarm);
        let aura = await AuraService.getCallOutStatus(alarm);
        let res = dbMap(alarm);
        res.aura = aura;
        return res;
    }

    async getAlarmInfo(alarmId) {

        let alarm = await Alarm.findById(alarmId);

        if (!alarm) {
            HttpUtil.throw400Error('Invalid request');
        }

        let createdTime = new Date(alarm.createdAt).getTime();;
        let nowTime = new Date().getTime();

        if (nowTime - createdTime > 86400000) {
            HttpUtil.throw400Error('This page is not available');
        }

        let profile = await Profile.findById(alarm.profileId);
        return {
            alarm: dbMap(alarm),
            profile: dbMap(profile)
        }
    }

    async getProfileFiles(alarmId) {

        let alarm = await Alarm.findById(alarmId);

        if (!alarm) {
            HttpUtil.throw400Error('Invalid request');
        }

        let createdTime = new Date(alarm.createdAt).getTime();;
        let nowTime = new Date().getTime();

        if (nowTime - createdTime > 86400000) {
            HttpUtil.throw400Error('This page is not available');
        }

        let files = await profileService.getProfileFiles(alarm.profileId);
        return files;
    }


    async handleAlarm(alarmInfo) {

        let location = {
            latitude: alarmInfo.latitude,
            longitude: alarmInfo.longitude
        };

        let device = await Device.getByManufactureId(alarmInfo.deviceId);
        let user = await User.findById(device.userId);
        let deviceRegions = await Region.getByDeviceId(device.id);
        let region = this.getRegion(location, deviceRegions);
        let contacts = await Contact.findByRegionId(region.id);

        let alarmData = {
            user: user,
            device: device,
            region: region,
            contacts: contacts,
            location: location
        };

        console.log(JSON.stringify(alarmData));

        let alarm = await alarmManager.handlePostAlarm(alarmData);
        return 'success';
    }

    getRegion(location, regions) {
        let currentRegion = regions.filter(x => x.isDefault)[0];

        for (let i in regions) {
            let region = regions[i];
            if (!region.isDefault) {
                let distanceToRegion = distance.meters(region.latitude, region.longitude, location.latitude, location.longitude);
                if (distanceToRegion < region.radius) { currentRegion = region; }
            }
        }

        return currentRegion;
    }
};