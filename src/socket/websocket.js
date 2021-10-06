const iosocket = require('socket.io');

var WebSocket = module.exports = {
    io: null,
    init: (server) => {
        WebSocket.io = iosocket.listen(server);
    },
    emit: (name, data) => {
        WebSocket.io.emit(name, data);
    }
}