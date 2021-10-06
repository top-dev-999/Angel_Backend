const Profile = require('../../../models/profile');
const ProfileFile = require('../../../models/profile-file');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class ProfileService {

    constructor() { }

    async getAccountProfiles(accountId) {
        let profiles = await Profile.findByAccountId(accountId);
        return profiles.map(x => dbMap(x));
    }

    async getProfile(accountId, profileId) {
        let profile = await Profile.findById(profileId);
        if (!profile || profile.accountId != accountId) {
            HttpUtil.throw400Error('Invalid Request');
        }
        return dbMap(profile);
    }

    async createProfile(accountId, profileInput) {

        let profile = new Profile({
            accountId: accountId,
            name: profileInput.name,
            surname: profileInput.surname,
            cellPhone: profileInput.cellPhone,
            email: profileInput.email,
            idNumber: profileInput.idNumber,
            allergies: profileInput.allergies,
            comments: profileInput.comments
        });
        await profile.save();

        return dbMap(profile);
    }

    async updateProfile(accountId, profileId, profileInput) {

        let profile = await Profile.findById(profileId);
        if (!profile || profile.accountId != accountId) {
            HttpUtil.throw400Error('Invalid Request');
        }

        profile.name = profileInput.name;
        profile.surname = profileInput.surname;
        profile.cellPhone = profileInput.cellPhone;
        profile.email = profileInput.email;
        profile.idNumber = profileInput.idNumber;
        profile.allergies = profileInput.allergies;
        profile.comments = profileInput.comments;

        await profile.save();

        return dbMap(profile);
    }



    async createProfileFile(profileId, file) {
        let userFile = new ProfileFile({
            profileId: profileId,
            file: file
        });
        await userFile.save();

        return dbMap(dbUserFile);
    }

    async getProfileFiles(profileId) {
        let files = await ProfileFile.findByProfileId(profileId);
        return files.map(x => dbMap(x));
    }

    async deleteProfileFile(profileFileId) {
        // TODO: add some validation here
        return await ProfileFile.findByIdAndDelete(profileFileId);
    }

};