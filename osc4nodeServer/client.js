/****************************************************
 *
 * OSC Client
 *
 ****************************************************/

var Client = module.exports = function(host, port) {
    this._port = port;
    this._host = host;
};

Client.prototype.__defineGetter__('host', function() {
    return this._host;
});

Client.prototype.__defineGetter__('port', function() {
    return this._port;
});