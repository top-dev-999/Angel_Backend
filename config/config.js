
const API_PORT = 3000;

var config = {
    database: 'mongodb+srv://angelalert:eGWmwSJWaTfnH0NgOzJZP3TmzpR0nLPV68mM@angelasp-sdtv9.mongodb.net/angel_alert?retryWrites=true&w=majority',
    //database: 'mongodb://angelalert:L3g3nd12@devices.angelasp.co.za:27017/angel_alert',

    secret: 'zUbDjhQdXmrWlscbvlktnrfwlsaikdfjiu9jvSw7nw',

    //clickatellApiKey: 'GSIT3IXYTyqzVjdjR1Wm0Q==', // Terry
    clickatellApiKeyTwoWay: '3Iq1_DfETc-M2hxHh5NUVg==',
    clickatellNumberTwoWay: '+1 339 707 7790',

    clickatellApiKeyOneWay: '3Iq1_DfETc-M2hxHh5NUVg==',
    clickatellApiKeyTwoWay2: 'M2mzogKpRVKBWr6s0S4eHQ==',
    clickatellNumberTwoWay2: '32154',

    API_PORT: API_PORT,
    SOCKET_PORT: 9007,

    hmacKey: "fufVfUa9jvMLv7iKMCzk",

    baseUrl: 'http://devices.angelaspirations.com',

    auraClientId: '7Vjmx9A4ZvhjNENA51P86tW5ZhkxUBZw',
    auraClientSecret: 'oDnPWtVE_Y_Ov8md9URC-wdeHaLkrsokqMWDLLkCew9FIIuy96IYc0HTioegmMre',
    auraRequestType: 'ANGEL_TEST',
    auraBaseUrl: 'https://staging-panic.aura.services/panic-api/',
};

if (process.env.NODE_ENV == 'prod') {
    config.database = 'mongodb+srv://angelalert:eGWmwSJWaTfnH0NgOzJZP3TmzpR0nLPV68mM@angelasp-sdtv9.mongodb.net/angel_alert?retryWrites=true&w=majority';
    config.baseUrl = 'http://devices.angelaspirations.com';

    //config.auraBaseUrl = 'https://panic.aura.services/panic-api/';
    //config.auraRequestType = 'ANGEL';
}

module.exports = config;
