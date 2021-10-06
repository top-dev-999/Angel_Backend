const AlarmManager = require('../alarm-manager/alarm-manger');

const Communication = require('../models/communication');
const Device = require('../models/device');
const Wifi = require('../models/wifi');

const io = require("./websocket");
const locationUtil = require('../utilities/location-util');
const gsmMessageTypes = require('../utilities/gsm-message-types');
const socketUtil = require('../utilities/socket-util');

const alarmStatuses = [204];
const validStartSequences = ['ZZZ','AAA'];
const programmingStartSequences = ['AAA'];
const validEndSequences = ['MMM'];

exports.onDataReceived = function (socket, receivedData) {

    let receivedString = socketUtil.bytesToString(receivedData);

    if (isGsmRequest(receivedString)) {
        handleGsmRequest(socket, receivedString);
    } else {
        handleWifiRequest(socket, receivedString);
    }    
};

const isGsmRequest = function(receivedString) {
    return receivedString.startsWith('*');
}

const handleGsmRequest = function(socket, receivedString) {
    let data = decodeGsmData(receivedString);
    if (!data) { // data is not formatted correctly
        io.emit('log', `Invalid TCP Data: '${receivedString}'`);
        socket.destroy();
        return;
    }

    if (data.messageType == gsmMessageTypes.IMPACT || data.messageType == gsmMessageTypes.HELP) {
        AlarmManager.handleGsmAlarm(data);
    }

    let responseString = getGsmResponse();
    socket.write(socketUtil.stringToBytes(responseString));
    saveCommunication(socket, receivedString, responseString.toString());
}

const decodeGsmData = function(receivedString) {
    let messageParts = receivedString.split('\r\n').filter(n => n);
    if (messageParts.length != 2) { return null; }

    let deviceParts = messageParts[0].split('-').filter(n => n);
    if (deviceParts.length != 4 && deviceParts.length != 5) { return null; }

    let unitId = deviceParts[0].split('*').join('');
    let messageType = deviceParts[1];
    let impactLevel = null;
    let batteryVoltage = deviceParts[2];
    let locationType = deviceParts[3];
    if (messageType == '1') {
        impactLevel = deviceParts[2];
        batteryVoltage = deviceParts[3];
        locationType = deviceParts[4];
    }
    let location = locationUtil.getLatLongFromMapUrl(messageParts[1]);
    
    return {
        unitId,
        messageType,
        impactLevel,
        batteryVoltage,
        locationType,
        location
    };
}

const getGsmResponse = function() {
    return 'MMMMM';
}

const saveCommunication = async function(socket, receivedString, responseString) {

    let communication = new Communication({
        source: 'tcp',
        from: socket.remoteAddress + ':' + socket.remotePort,
        received: JSON.stringify({ data: receivedString }),
        response: JSON.stringify({ data: responseString })
    });
    await communication.save();

    io.emit('comm', communication);
}


const handleWifiRequest = async function(socket, receivedString) {
    let data = decodeWifiData(receivedString);
    if (!data) { // data is not formatted correctly
        io.emit('log', `Invalid TCP Data: '${receivedString}'`);
        socket.destroy();
        return;
    }

    let isProgramming = programmingStartSequences.includes(data.startSequence);
    if (isProgramming) {
        let response = await getWifiProgrammingResponse(data);

        socket.write(response);
        saveCommunication(socket, receivedString, response.toString());
    } else {
        if (alarmStatuses.includes(data.status)) {
            AlarmManager.handleWifiAlarm(data.unitId);
        }

        socket.write(socketUtil.stringToBytes(receivedString));
        saveCommunication(socket, receivedString, receivedString);
    }
}

/*
    sets of 3

    1 - 3 are id
    4 is status
    5 - 6 are the tags age
    7 - 8 are is the RSSI
    9 - 11 is the reader id

    example ZZZ000002088000000000003151001002003MMM
*/
const decodeWifiData = function (data) {

    let startSequence = data.substring(0, 3);
    let endSequence = data.substring(data.length - 3, data.length);

    let isStartSequenceValid = validStartSequences.includes(startSequence);
    let isEndSequenceValid = validEndSequences.includes(endSequence);

    if (isStartSequenceValid && isEndSequenceValid) {
        let unitId = data.substring(3, 12);

        let status = parseInt(data.substring(12, 15));

        let age1 = parseInt(data.substring(15, 18));
        let age2 = parseInt(data.substring(18, 21));

        let rssi1 = parseInt(data.substring(21, 24));
        let rssi2 = parseInt(data.substring(24, 27));

        let readerId1 = parseInt(data.substring(27, 30));
        let readerId2 = parseInt(data.substring(30, 33));
        let readerId3 = parseInt(data.substring(33, 36));

        let age = (age1 * 256) + (age2);
        let rssi = (rssi1 * 256) + (rssi2);
        let readerId = (readerId1 * 256 * 256) + (readerId2 * 256) + (readerId3);

        return {
            unitId: unitId,
            status: status,
            age: age,
            rssi: rssi,
            readerId: readerId,
            startSequence: startSequence,
            date: new Date()
        }
    }

    return null;
}

const getWifiProgrammingResponse = async function(decodedData) {
    
    try {
        let device = await Device.findByUnitId(decodedData.unitId);
        let wifi = await Wifi.findByDeviceId(device.id);
        
        if (wifi) {
            let response = [];

            let wifiString = '"' + wifi.ssid + '"' + ',' + '"' + wifi.password + '"';
            
            response.push(decodedData.startSequence.charCodeAt(0));
            response.push(wifiString.length);
            
            for (let i = 0; i < wifiString.length; i++) {
                response.push(wifiString.charCodeAt(i))
            }
            response.push(13);
            response.push(10);
            
            wifi.isSynced = true;
            await wifi.save();

            return socketUtil.stringToBytes(response);
            
        } else {
            return getNoProgrammingResponse(decodedData);
        }
    } catch(err) {
        return getNoProgrammingResponse(decodedData);
    }
}

const getNoProgrammingResponse = function(decodedData) {
    let response = [];
    response.push(decodedData.startSequence.charCodeAt(0));
    response.push(0);
    response.push(13);
    response.push(10);
    
    return socketUtil.stringToBytes(response);
}

