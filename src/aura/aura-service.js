const request = require('request-promise-native');
const jwt = require('jsonwebtoken');

const randomString = require('../utilities/random-string');
const config = require('../../config/config');

var serverAuthToken = null;

const fetchServerAuthToken = async () => {
  if (!serverAuthToken || isServerTokenExpired()) {
    let body = {
      clientId: config.auraClientId,
      clientSecret: config.auraClientSecret
    };
    let token = await fetchAuthToken(body);
    serverAuthToken = token;
  }
  return serverAuthToken;
};

const isServerTokenExpired = () => {
  let decoded = jwt.decode(serverAuthToken);
  return Date.now() > decoded.exp * 1000;
};

const fetchUserAuthToken = async (profile) => {
  let body = {
    clientId: config.auraClientId,
    email: profile.email,
    password: profile.auraPassword
  };
  let token = await fetchAuthToken(body);
  return token;
}

const fetchAuthToken = async (body) => {
  let options = {
    method: 'POST',
    uri: config.auraBaseUrl + 'oauth/token',
    body: body,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  };
  let result = await request(options);
  return result.accessToken;
}

const createUserOnAura = async (profile) => {
  let serverToken = await fetchServerAuthToken();
  let password = randomString.generate(10);
  let options = {
    method: 'POST',
    uri: config.auraBaseUrl + 'oauth/user',
    body: {
      email: profile.email,
      password: password,
      mobileNumber: profile.cellPhone,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + serverToken,
    },
    json: true
  };
  let result = await request(options);

  profile.auraPassword = password;
  await profile.save();

  return result.message;
}


exports.createCallOut = async (profile, alarm) => {
  if (!profile.auraPassword) {
    await createUserOnAura(profile);
  }

  let token = await fetchUserAuthToken(profile);
  let body = {
    customer: {
      name: profile.name,
      surname: profile.surname,
      email: profile.email,
      mobile: profile.cellPhone
    },
    calloutLocation: {
      latitude: alarm.latitude,
      longitude: alarm.longitude
    },
    requestType: config.auraRequestType,
  };


  let options = {
    method: 'POST',
    uri: config.auraBaseUrl + 'callouts',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    json: true
  };
  let result = await request(options);
  alarm.auraCallOutId = result.data.callout.id;
  await alarm.save();
};

exports.getCallOutStatus = async (alarm) => {
  if (alarm.auraCallOutId) {
    let token = await fetchServerAuthToken();

    let options = {
      method: 'GET',
      uri: config.auraBaseUrl + 'callouts/' + alarm.auraCallOutId,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      json: true
    };
    let result = await request(options);
    return result;
  }
  return null;
};


exports.dismissCallOut = async (alarm) => {
  if (alarm.auraCallOutId) {
    let token = await fetchServerAuthToken();

    let options = {
      method: 'POST',
      uri: config.auraBaseUrl + 'callouts/' + alarm.auraCallOutId + '/dismiss',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: {},
      json: true
    };
    let result = await request(options);
    return result;
  }
  return null;
};