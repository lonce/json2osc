/*
We use websockets for communicating between application and server.
Then there is the 
   oscServer - for sending message to the client
   oscClient - (very thin - just saves the host and port of the reciever)
which both use UDP (thus socket.io and osc4nodeServer).
*/

var express = require("express")
, app = express()
, server = require('http').createServer(app)
, WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server})
, fs = require('fs')
, io = require('socket.io')
, osc = require('./osc4nodeServer');


var k_portnum = 8082;
var synth_portnum = "8090";

var id = 1; 

var oscServer
  , oscClient;

console.log("json2osc server is starting with command line arguments:");
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
if (process.argv.length < 4){
    console.log("usage: node myserver listen_portnum synth_portnum");
    process.exit(1);
}
k_portnum=process.argv[2];
synth_portnum=process.argv[3];

var config = {
    "client": {
        "host": "127.0.0.1",
        "port": synth_portnum
    },
    "server": {
        "host": "127.0.0.1",
        "port": k_portnum
    }

};


//***************************************************************************
//****************************************************************************
//app.use(express.static(__dirname + "/www"));
server.listen(process.argv[2] || k_portnum);
console.log("Connected and listening on port " + k_portnum);

function sendJSONmsg(ws, name, data, source) {
    ws.send(JSON.stringify({n: name, d: data, s:source}));
}


wss.on('connection', function (ws) {
    ws.id = id++;
    console.log("got a connection, assigning ID = " + ws.id);

    sendJSONmsg(ws, 'init', [ws.id, Date.now()]); // just a handshake

    ws.on('close', function() {        
        console.log(ws.id + " is gone..." );
    });

    ws.on('message', receiveJSONmsg.bind(ws));

    ws.on('disconnect', function(){
        console.log("disconnecting");
        ws.broadcast({ disconnection: ws.sessionId});
    });
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// parse all incoming messages and use messages to call the registered "callbacks"
function receiveJSONmsg(data, flags) {
    var obj;
    try {
        obj = JSON.parse(data);
    } catch (e) {
        console.log("received error in message");
        return;
    }

    if (!obj.hasOwnProperty('d') || !obj.hasOwnProperty('n') || callbacks[obj.n] === undefined)
        return;
    callbacks[obj.n].call(this, obj.d);
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// message handling - functions.called to pass in 'this' (socket) contexts
var callbacks = {};
function registerCallback(name, callback) {
    callbacks[name] = callback;
    //console.log("callbacks["+name+"]="+callback);
}
//-------------------------------------------------
// Take an array of adress followed by arguments, and let the server do its thing to
//     convert into an OSC message and send to the client
registerCallback('myOscMessage', myOscMessage);
function myOscMessage(d){
    //console.log(" message looks like: " + d);
    var msg = new osc.Message(d[0]);
    for (var i=1;i<d.length;i++){
        msg.add(d[i]);
    }
    oscServer.send(msg, oscClient);
}
//-------------------------------------------------


        oscServer = new osc.Server(config.server.port, config.server.host);
        oscClient = new osc.Client(config.client.host, config.client.port);

 

       
registerCallback('config', config);
function config(d){
    var ws = this;
    var obj =d;
    
    // in this example, server receives config object from browser-client at first.
    // it contains 'port' and 'host' settings for Server and Client.
    if ('config' in obj) {
        console.log("Got a valid configuration to initialize oscServer/Client");
        var config = obj.config;
        //oscServer = new osc.Server(config.server.port, config.server.host);
        //oscClient = new osc.Client(config.client.host, config.client.port);
        
        ws.send({ info: 'oscServer created: [port: ' + oscServer.port + ', host: ' + oscServer.host + ']' });
        ws.send({ info: 'oscClient created: [port: ' + oscClient.port + ', host: ' + oscClient.host + ']' });
        
        var msg = new osc.Message('/status', ws.id + ' connected');
        oscServer.send(msg, oscClient);

        // Tell the OSC message source to bring it on.
        sendJSONmsg(ws, 'oscServerReady', [oscServer.host, config.server.port]);
        
        // oscServer dispatches 'oscmessage' event when receives the message.
        // so we attach handler on the event for global message handling.
        oscServer.on('oscmessage', function(msg, rinfo) {
            console.log(msg);
            ws.send({
                oscmessage: {
                    address: msg.address
                  , typetag: msg.typetag
                  , args: msg.arguments
                }
            });
        });
    } else if ('oscmessage' in obj) {
        var msg = obj.oscmessage;
        
        // create Bundle
        var bundle   = new osc.Bundle()
          , msg1 = new osc.Message(msg.address, msg.message)
          , msg2 = new osc.Message('/status', 'from ' + ws.sessionId + ' at ' + new Date().toString());
        
        // to bundle messages, simply call 'add()' with instance of the Message.
        bundle.add(msg1);
        bundle.add(msg2);
        
        // set timetag.
        bundle.setTimetag(bundle.now());
        
        // we can send Bundle in the same way as Message.
        if (oscServer && oscClient) oscServer.send(bundle, oscClient);
    }
}


exports.server = server;

