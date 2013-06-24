define(
	[],
	function () {
		var ws;  // for communicating with the osc server


		//List of messages we can handle from the server (and other clients via the server)
		var callbacks = {};
		var registerCallback = function (name, callback) {
			callbacks[name] = callback;
		};

		// osc server sends us 'init' as a handshake 
		registerCallback('init', init);
		function init(ws, d, s){
			console.log("OK - connection established - send config data to initialzing OSC server");
		}


		registerCallback('oscServerReady', oscServerReady);
		function oscServerReady(data){
			console.log("server says oscServer ready for osc messages!!");
		}


		// for processing all incoming messages
		var receiveJSONmsg = function (data, flags) {
			var obj;
			try {
				obj = JSON.parse(data);
			} catch (e) {
				return;
			}
			console.log("comm: received JSON message ",  obj);
			// All messages should have 
			//	.n - name of method to call (this is the "message"),
			//	.d - the data payload (methods must know the data they exepct)
			//	.s - an id of the remote client sending the message

			if (!obj.hasOwnProperty('d') || !obj.hasOwnProperty('n') || callbacks[obj.n] === undefined)
				return;
			callbacks[obj.n].call(this, obj.d, obj.s);
		}

		// For sending local client events to the server
		var sendJSONmsg = function (name, data) {
			console.log("comm: will send a message to the server with the name " + name + " and data = " + data);
			ws.send(JSON.stringify({n: name, d: data}));//, {mask: true});
		};


		return { 
			//host: host,
			registerCallback: registerCallback,
			sendJSONmsg: sendJSONmsg,
			configure: function(clientAddress, clientPort){

				// Set up the socket as specified
				ws = new WebSocket('ws://' + clientAddress + ":" + clientPort);
				ws.addEventListener('message', function(e){receiveJSONmsg.call(ws, e.data)});

			}
		};
	}
);


