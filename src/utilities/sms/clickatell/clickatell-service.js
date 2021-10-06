const Request = require('request');

const getRequestOptions = function (content, to, from, apiKey) {
    // set options array
    content = JSON.stringify(content);
    to = JSON.stringify(to);
    var options = {
        method: 'POST',
        url: 'https://platform.clickatell.com/messages',
        headers:
        {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"content":' + content + ',"to":' + to + '}'
    }

    if (from) {
        from = JSON.stringify(from);
        options.body = '{"content":' + content + ',"to":' + to + ',"from":' + from + '}';
    }

    return options;
};

const sendOneWayMessage = function (content, to, apiKey) {
    let options = getRequestOptions(content, to, null, apiKey);

    // send the request
    Request(options, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
    });
};

const sendTwoWayMessage = function (content, to, from, apiKey) {
    let options = getRequestOptions(content, to, from, apiKey);

    // send the request
    Request(options, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
    });
};

module.exports = {
    sendOneWayMessage: sendOneWayMessage,
    sendTwoWayMessage: sendTwoWayMessage
}