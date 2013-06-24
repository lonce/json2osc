/****************************************************
 *
 * OSC Datatypes
 *
 ****************************************************
 */


var jspack = require('./jspack/jspack').jspack;


/**
 * public interface for create new argument.
 *
 * @param value
 * @api public
 *
 */
var OscArgument = module.exports = function(value, typehint) {
    if (arguments.length == 1) {
        switch (typeof value) {
            case 'number':
                if (Math.floor(value) == value) {
                    return new OscInt(Math.floor(value));
                } else {
                    return new OscFloat(value);
                }
                break;
            case 'string':
                return new OscString(value);
                break;
            default:
                throw new Error("Message::add - don't know how to encode " + value);
        }
    } else if (arguments.length == 2) {
        return this.constructors[typehint](value)
    }
};

OscArgument.prototype.constructors = {
    'i': function(val) { return new OscInt(val); },
    'f': function(val) { return new OscFloat(val); },
    'd': function(val) { return new OscDouble(val); },
    's': function(val) { return new OscString(val); },
    't': function(val) { return new OscTimetag(val); },
    'b': function(val) { return new OscBlob(val); }
};

OscArgument.prototype.fromTypehint = function(typehint) {
    if (typehint in this.constructors) {
        return this.constructors[typehint]();
    }
};

/**
 * perform as interface and superclass of
 * all data types.
 *
 * @param value
 * @param typetag
 * @api private
 *
 */
var OscDataType = function(value, typetag) {
    this.value   = value;
    this.typetag = typetag;
};
OscDataType.prototype = {
    value  : '',
    typetag: '',
    decode : function() {},
    endode : function() {}
};


var OscString = function(value) {
    this.super(value, this.typetag);
};
OscString.prototype = {
    super: OscDataType,
    typetag: 's',
    decode: function (data) {
        var end = 0;
        while (data[end] && end < data.length) {
            end++;
        }
        if (end == data.length) {
            throw Error("Osc string not null terminated");
        }
        this.value = data.toString('ascii', 0, end);
        var nextData = parseInt(Math.ceil((end + 1) / 4.0) * 4);
        return data.slice(nextData);
    },
    encode: function (buf, pos) {
        var len = Math.ceil((this.value.length + 1) / 4.0) * 4;
        return jspack.PackTo('>' + len + 's', buf, pos, [ this.value ]);
    }
};

var OscInt = function(value) {
    this.super(value, this.typetag);
};
OscInt.prototype = {
    super: OscDataType,
    typetag: 'i',
    decode: function (data) {
        if (data.length < 4) {
            throw new ShortBuffer('int', data, 4);
        }

        this.value = jspack.Unpack('>i', data.slice(0, 4))[0];
        return data.slice(4);
    },
    encode: function (buf, pos) {
        return jspack.PackTo('>i', buf, pos, [ this.value ]);
    }
};

var OscFloat = function(value) {
    this.super(value, this.typetag);
};
OscFloat.prototype = {
    super: OscDataType,
    typetag: 'f',
    decode: function (data) {
        if (data.length < 4) {
            throw new ShortBuffer('float', data, 4);
        }

        this.value = jspack.Unpack('>f', data.slice(0, 4))[0];
        return data.slice(4);
    },
    encode: function (buf, pos) {
        return jspack.PackTo('>f', buf, pos, [ this.value ]);
    }
};

var OscDouble = function(value) {
    this.super(value, this.typetag);
};
OscDouble.prototype = {
    super: OscDataType,
    typetag: 'd',
    decode: function (data) {
        if (data.length < 8) {
            throw new ShortBuffer('double', data, 8);
        }
        this.value = jspack.Unpack('>d', data.slice(0, 8))[0];
        return data.slice(8);
    },
    encode: function (buf, pos) {
        return jspack.PackTo('>d', buf, pos, [ this.value ]);
    }
};

var OscTimetag = function(value) {
    this.super(value, this.typetag);
};
OscTimetag.prototype = {
    super: OscDataType,
    typetag: 't',
    decode: function (data) {
        if (data.length < 8) {
            throw new ShortBuffer('time', data, 8);
        }
        this.value = jspack.Unpack('>ll', data.slice(0, 8))[0];
        return data.slice(8);
    },
    encode: function (buf, pos) {
        return jspack.PackTo('>ll', buf, pos, this.value);
    }
};

var OscBlob = function(value) {
    this.super(value, this.typetag);
};
OscBlob.prototype = {
    super: OscDataType,
    typetag: 'b',
    decode: function (data) {
        var length = jspack.Unpack('>i', data.slice(0, 4))[0];
        var nextData = parseInt(Math.ceil((length) / 4.0) * 4) + 4;
        this.value = data.slice(4, length + 4);
        return data.slice(nextData);
    },
    encode: function (buf, pos) {
        var len = Math.ceil((this.value.length) / 4.0) * 4;
        return jspack.PackTo('>i' + len + 's', buf, pos, [len, this.value]);
    }
};

var ShortBuffer = function(type, buf, requiredLength) {
    this.type = "ShortBuffer";
    var message = "buffer [";
    for (var i = 0; i < buf.length; i++) {
        if (i) {
            message += ", ";
        }
        message += buf.charCodeAt(i);
    }
    message += "] too short for " + type + ", " + requiredLength + " bytes required";
    this.message = message;
};