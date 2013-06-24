/****************************************************
 *
 * OSC Bundle
 *
 ****************************************************/

var OscArgument = require('./datatypes')
  , Message     = require('./message');

var Bundle = module.exports = function() {
    this._messages = [];
    this._timetag = 1;
    
    if (arguments.length > 0) {
        var args = Array.prototype.slice.call(arguments);
        for (var i in args) {
            this.add(args[i]);
        }
    }
};

// offset from 1.1.1900 - 1.1.1970
Bundle.prototype.TIMETAG_OFFSET = 2208988800;

/**
 * Add new message to the bundle.
 *
 * @param arg
 *
 */
Bundle.prototype.add = function (arg) {
    if (arg instanceof Message) {
        this._messages.push(arg);
    } else {
        throw new Error('Argument must be instance of Message: ' + arg);
    }
};

/**
 * Remove all messages from the bundle.
 *
 */
Bundle.prototype.removeMessages = function() {
    this._messages = [];
};

/**
 * Remove message by given index.
 *
 * @param arg
 *
 */
Bundle.prototype.removeMessageAt = function(index) {
    this._messages.splice(index, 1); 
};

/**
 * Return an array of messages.
 *
 */
Bundle.prototype.getMessages = function() {
    return this._messages;
};

/**
 * Return message by given index.
 *
 * @param arg
 *
 */
Bundle.prototype.getMessageAt = function(index) {
    return this._messages[index] || undefined;
};

Bundle.prototype.getTimetag = function() {
    return new OscArgument(this._timetag, 't');
};

Bundle.prototype.setTimetag = function(time) {
    var secsOffset = time / 1000 + this.TIMETAG_OFFSET;
    var secsFractional = ((time % 1000) << 32) / 1000;
    this._timetag = (secsOffset << 32) | secsFractional;
};

Bundle.prototype.now = function() {
    return Date.now();
};

Bundle.prototype.size = function() {
    return this._messages.length;
}

Bundle.prototype.getBinary = function () {
    var bundle = new OscArgument('#bundle', 's'),
        binary = [],
        pos    = bundle.encode(binary, 0);
    
    pos = this.getTimetag().encode(binary, pos);
    
    for (var i = 0; i < this._messages.length; i++) {
        var mBinary = this.getMessageAt(i).getBinary();
        pos = new OscArgument(mBinary.length, 'i').encode(binary, pos);
        binary = binary.concat(mBinary);
        pos = binary.length;
    }
    return binary;
};