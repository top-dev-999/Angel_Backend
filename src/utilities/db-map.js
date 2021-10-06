
module.exports = function(dbObject) {
    let keys = Object.keys(dbObject._doc);

    let reply = {};

    for (let i in keys) {
        let key = keys[i];
        if (key.startsWith('_')) {
            if (key == '_id') {
                reply.id = dbObject.id;
            }
        } else {
            reply[key] = dbObject[key];
        }
    }

    return reply;
};