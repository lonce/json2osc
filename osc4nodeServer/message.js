/****************************************************
 *
 * OSC Message
 *
 ****************************************************
 */

var OscArgument = require('./datatypes');

   
var Message = module.exports = function(address) {
    this._address = address;
    this._typetag = '';
    this._args    = [];
    
    if (address instanceof Buffer) {
        var decoded = this.decode(address);
        console.log(decoded);
        this._address = decoded._address;
        this._typetag = decoded._typetag;
        this._args    = decoded._args;
    } else {
        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments);
            for (var i = 1; i < args.length; i++) {
                this.add(args[i]);
            }
        }
    }
};

Message.prototype.__defineGetter__('address', function() {
    return this._address;
});
Message.prototype.__defineSetter__('address', function(value) {
    this._address = value;
});

Message.prototype.__defineGetter__('typetag', function() {
    return this._typetag;
});

Message.prototype.__defineGetter__('arguments', function() {
    return this._args;
});


/**
 * add argument.
 * you should not use this method extarnally.
 *
 * @api private
 *
 */
Message.prototype._add = function(arg) {
    if (typeof arg === 'object') {
         if ((arg.super && arg.super.name === 'OscDataType') ||
            (typeof arg.typetag !== undefined && typeof arg.value !== undefined)) {
            this._typetag += arg.typetag;
            this._args.push(arg);
        } else {
            throw new Error('Invalid argument' + arg);
        }
    } else {
        var oscArg = new OscArgument(arg);
        this._typetag += oscArg.typetag;
        this._args.push(oscArg);
    }
};

/**
 * add argument.
 *
 * @api public
 *
 */
Message.prototype.add = function(args) {
    if (args instanceof Array) {
        for (var i in args) {
            this._add(args[i]);
        }
    } else {
        if (arguments.length == 1) {
            this._add(args);
        } else if (arguments.length > 1) {
            args = Array.prototype.slice.call(arguments);
            for (i in args) {
                this._add(args[i]);
            }
        } else {
            throw new Error("argument(s) is missing");
        }
    }
};

/**
 * initialize properties.
 * 
 * @api public
 *
 */
Message.prototype.clear = function() {
    this._address = '';
    this._typetag = '';
    this._args    = [];
};

/**
 * return clone of this message.
 * 
 * @api public
 *
 */
Message.prototype.clone = function() {
    var msg = new Message();
    msg._address = this._address;
    msg._typetag = this._typetag;
    msg._args    = this._args;
    return msg;
};

/**
 * return true when given addrPattern equals to
 * the address of this message.
 * 
 * @param addrPattern
 * @api public
 *
 */
Message.prototype.checkAddrPattern = function(addrPattern) {
    return this._address == addrPattern;
};


/**
 * return true when given typetag equals to
 * the typetag of this message.
 * 
 * @param typetag
 * @api public
 *
 */
Message.prototype.checkTypetag = function(typetag) {
    return this._typetag == typetag;
};


/**
 * return binary representation of this message.
 * 
 * @api public
 *
 */
Message.prototype.decode = function(data) {
    var msg  = this.clone()
      , addr = new OscArgument().fromTypehint('s');
    
    data = addr.decode(data);
    msg._address = addr.value;

    if (data.length > 0) {
        var typetag = new OscArgument().fromTypehint('s');
        data = typetag.decode(data);
        typetag = typetag.value;
        
        if (typetag[0] != ',') {
            throw new Error('Typetag must starts with ","');
        }
        
        var a;
        for (var i = 1; i < typetag.length; i++) {
            if (!constructor) {
                throw "Unsupported OSC typetag " + typetag[i] + " in incoming message";
            }
            a = new OscArgument().fromTypehint(typetag[i]);
            data = a.decode(data);
            msg.add(a);
        }
    }
    
    return msg;
};

/**
 * return binary representation of this message.
 * 
 * @api public
 *
 */
Message.prototype.getBinary = function () {
    var address = new OscArgument(this._address)
      , binary = []
      , pos = 0;
    
    pos = address.encode(binary, pos);
    if (this.typetag) {
        var typetag = new OscArgument(',' + this._typetag);
        pos = typetag.encode(binary, pos);
        for (var i = 0; i < this._args.length; i++) {
            pos = this._args[i].encode(binary, pos);
        }
    }
    return binary;
};