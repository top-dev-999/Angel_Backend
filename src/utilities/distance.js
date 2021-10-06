var exports = module.exports = {};

const EARTH_RADIUS_IN_METERS = 6371000;

exports.meters = function (lat1, long1, lat2, long2) {
    return haversineDistance(lat1, long1, lat2, long2);
}

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

const haversineDistance = (lat1, long1, lat2, long2) => {
    let delta_lat = Math.radians(lat2 - lat1);
    let delta_lon = Math.radians(long2 - long1);
    let lat_1 = Math.radians(lat1);
    let lat_2 = Math.radians(lat2);

    let central_angle = haversine(delta_lat) + haversine(delta_lon) * Math.cos(lat_1) * Math.cos(lat_2);
    return 2 * EARTH_RADIUS_IN_METERS * Math.asin(Math.sqrt(central_angle));
};

const haversine = (radians) => {
    return Math.pow(Math.sin(radians / 2), 2);
}