const net = require("net");

const config = require('../../config/config');
const comms = require('./comms-manager');

exports.startTCPServer = function () {

    var server = net.createServer(function (socket) {

        console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        socket.on('error', function(exception) {
            console.log('SOCKET ERROR:' + exception);
            socket.destroy();
        });
        
        socket.on('data', function (data) {

            let date = new Date();
            let now = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds();

            console.log('DATA ' + socket.remoteAddress + ': ' + data + ' ' + now);
            comms.onDataReceived(socket, data);
        });

        socket.on('close', function (data) {
            console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
        });

        // TODO: handle when the socket is inactive for too long

    });

    server.listen(config.SOCKET_PORT, () => {
        console.log('TCP Socket listening on port: ' + config.SOCKET_PORT);
    });
};