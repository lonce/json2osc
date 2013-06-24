var express = require("express")
, app = express()
, server = require('http').createServer(app)
, WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server});
//, fs = require('fs');

var k_portnum = 8082;

console.log("hey myserver is starting with command line arguments:");
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
if (process.argv.length < 3){
    console.log("usage: node myserver portnum");
    process.exit(1);
}
k_portnum=process.argv[2];


//****************************************************************************
var m_useRoot="/www";
app.use(express.static(__dirname + m_useRoot));
//app.use(express.bodyParser());

server.listen(process.argv[2] || k_portnum);
console.log("Connected and listening on port " + k_portnum);

wss.on('connection', function (ws) {

	console.log("got connection");

    ws.on('close', function() {        
        console.log("closing connection");
    });
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   




exports.server = server;

