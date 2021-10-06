const bytesToString = function (byteArray) {
    let length = byteArray.length;
    if (byteArray[length - 2] == 13 && byteArray[length - 1] == 10) {
        length -= 2;
    }

    var stringResult = "";
    for (var i = 0; i < length; i++) {
        stringResult += String.fromCharCode(byteArray[i]);
    }
    return stringResult;
}

const stringToBytes = function (string) {
    return new Buffer(string);
}

module.exports = {
    bytesToString,
    stringToBytes
};