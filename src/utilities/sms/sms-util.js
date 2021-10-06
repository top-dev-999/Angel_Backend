const clickatell = require('./clickatell/clickatell-service');
const config = require('../../../config/config'); 

const sendOneWayMessage = function(content, to) {

    if (config.clickatellApiKeyOneWay == config.clickatellApiKeyTwoWay) {
        sendTwoWayMessage(content, to);
    }
    else {
        if (!Array.isArray(to)) {
            to = [to];
        }
        
        clickatell.sendOneWayMessage(content, to, config.clickatellApiKeyOneWay);
    }
};

const sendTwoWayMessage = function(content, to) {

    if (!Array.isArray(to)) {
        to = [to];
    }

    clickatell.sendTwoWayMessage(content, to, config.clickatellNumberTwoWay, config.clickatellApiKeyTwoWay);
};


module.exports = {
    sendOneWayMessage: sendOneWayMessage,
    sendTwoWayMessage: sendTwoWayMessage
}