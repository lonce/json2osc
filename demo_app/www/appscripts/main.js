/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	We register for the following messages:
		init - sent by the server after the client connects. Data returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseClick - sent when another chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
*/


require(
	["require", "utils", "io_MessageMap"],

	function (require, utils,  messageMap) {

		var tb = window.document.getElementById("testButton");
		console.log("button is " + tb);

		var scb = window.document.getElementById("serverConfigureButton");
		scb.addEventListener('mousedown', function(e){
			console.log("main: calling configure");
			console.log("sa = "+ document.getElementById("serverAddress"));
			messageMap.configure(document.getElementById("serverAddress").value, document.getElementById("serverPort").value);
		});

		

		tb.addEventListener('mousedown', function(e) { 
			//var message = new Message("/test/1", "foo", 3, 8.6, "doh");
			//var message = ["/test/1", "foo", 3, 8.6, "doh"];
			var message=document.getElementById("oscMessage").value.split(", ");
			for(var i=0;i<message.length;i++){
				if (isNumber(message[i])) {
					message[i]=Number(message[i]);
				}
			}
			console.log(message);
			//var message = ["/test/1", "foo", 3, 8.6, "doh"];
			console.log("in main, message is " + message);
			messageMap.send(message);
		});

        //var myrequestAnimationFrame = utils.getRequestAnimationFrameFunc();
		myID=0;
		console.log("main is loaded");

		function isNumber(n) {
  			return !isNaN(parseFloat(n)) && isFinite(n);
		}

	}
);