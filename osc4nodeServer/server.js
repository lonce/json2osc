/****************************************************
 *
 * OSC Server
 *
 ****************************************************/

var Client      = require('./client')
  , Message     = require('./message')
  , OscArgument = require('./datatypes')
  , dgram       = require('dgram')
  , util        = require('util')
  , io          = require('socket.io');

var Server = module.exports = function(port, host) {
    process.EventEmitter.call(this);
    
    if (port && host) this.init(port, host);
};

util.inherits(Server, process.EventEmitter);

Server.prototype.__defineGetter__('host', function() {
    return this._host;
});
Server.prototype.__defineSetter__('host', function(value) {
    try {
        this.dispose();
        this._host = value;
        this.connect();
    } catch(e) {
        throw new Error(e.message);
    }
});

Server.prototype.__defineGetter__('port', function() {
    return this._port;
});
Server.prototype.__defineSetter__('port', function(value) {
    try {
        this.dispose();
        this._port = value;
        this.connect();
    } catch(e) {
        throw new Error(e.message);
    }
});

Server.prototype.init = function(port, host) {
    this._port = port;
    this._host = host;
    this._sock = dgram.createSocket('udp4');
    this.connect();
};

Server.prototype.connect = function() {
    this._sock.bind(this._port, this._host);
    
    var self = this;
    
    this._sock.on('message', function(msg, rinfo) {
        console.log("server got message to send " + msg);

        var decoded = new Message(msg);
        
        try {
            if (decoded) {
                self.emit('message', decoded, rinfo);
                self.emit('oscmessage', decoded, rinfo);
            }
        } catch (e) {
            console.log("Can't decode incoming message: " + e.message);
        }
    });
};

Server.prototype.dispose = function() {
    if (this._sock) this._sock.close();
};

Server.prototype.send = function (msg, client) {
      //console.log("server sending message " + msg);
    if (!client || !client instanceof Client) {
        throw new Error('Client must be instance of osc4node::Client');
    }
    
    var binary;
    if (msg.getBinary && typeof msg.getBinary === 'function') {
        binary = msg.getBinary();
    } else {
        var message = {};
        Message.apply(message, arguments)
        binary = Message.prototype.getBinary.call(message);
    }
    var buf = new Buffer(binary, 'binary');
    this._sock.send(buf, 0, buf.length, client.port, client.host);
};

function decode(data) {
    var message = new Message();
    
    var address = new OscArgument().fromTypehint('s');
    data = address.decode(data);
    message.address = address.value;

    if (data.length > 0) {
        var typetags = new OscArgument().fromTypehint('s');
        data = typetags.decode(data);
        typetags = typetags.value;
        
        if (typetags[0] != ',') {
            throw "invalid type tag in incoming OSC message, must start with comma";
        }
        
        for (var i = 1; i < typetags.length; i++) {
            var argument = new OscArgument().fromTypehint(typetags[i])
            data = argument.decode(data);
            message.add(argument);
        }
    }
    
    return message;
}