/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	We register for the following messages:
		init - sent by the server after the client connects. Data returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseClick - sent when another chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
*/

require.config({
	paths: {
		"osc": "../osc"
	}
});

define(
	["comm"],

	function (comm) {

		var servermsg={};

		servermsg.configure=function(ca,cp,sa,sp){
			console.log("io_messageMap call configure with ca = " + ca + ", and cp = " + cp);
			comm.configure(ca,cp,sa,sp);
		}

		servermsg.send= function (oscstring){
			//var message = ["/test/1", "foo", 3, 8.6, "doh"];
			console.log("io_map: oscstring is " + oscstring);
			comm.sendJSONmsg('myOscMessage', oscstring);	
		}

		return servermsg;
});

