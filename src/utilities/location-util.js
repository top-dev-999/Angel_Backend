var exports = module.exports = {};

exports.getLatLongFromMapUrl = function (mapUrl) {

    if (mapUrl.includes('http://maps.google.com/maps?q=')) {
        //http://maps.google.com/maps?q=30%2055.8553S%20030%2018.3906E

        //30 55.8553S 030 18.3906E
        mapUrl = mapUrl.replace('http://maps.google.com/maps?q=', '');

        let mapParts = mapUrl.split('%20');

        let latDegrees = mapParts[0];
        let latMinutes = mapParts[1];

        let longDegrees = mapParts[2];
        let longMinutes = mapParts[3];

        let location = {
            latitude: getLatitude(latDegrees, latMinutes),
            longitude: getLongitude(longDegrees, longMinutes)
        };

        return location;
    } else {
        let mapParts = mapUrl.split(',');
        let lat = mapParts[0].replace('lat:', '');
        let long = mapParts[1].replace('long:', '');

        console.log(lat);
        console.log(long);

        return {
            latitude: parseFloat(lat),
            longitude: parseFloat(long)
        };
    }
}

const getLatitude = function (latDegrees, latMinutes) {
    let degrees = parseFloat(latDegrees);
    let multiplier = 1;

    if (!latMinutes.includes('S') && !latMinutes.includes('N')) {
        latMinutes = latMinutes.substring(0, latMinutes.length - 1);
        multiplier = -1;
    }

    if (latMinutes.includes('S')) {
        latMinutes = latMinutes.replace('S', '');
        multiplier = -1;
    }

    if (latMinutes.includes('N')) {
        latMinutes = latMinutes.replace('N', '');
    }

    let minutes = parseFloat(latMinutes);
    return (degrees + (minutes / 60)) * multiplier;
}

const getLongitude = function (longDegrees, longMinutes) {
    let degrees = parseFloat(longDegrees);
    let multiplier = 1;

    if (longMinutes.includes('W')) {
        longMinutes = longMinutes.replace('W', '');
        multiplier = -1;
    }

    if (longMinutes.includes('E')) {
        longMinutes = longMinutes.replace('E', '');
    }

    let minutes = parseFloat(longMinutes);
    return (degrees + (minutes / 60)) * multiplier;
}