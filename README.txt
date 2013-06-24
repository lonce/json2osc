json2osc is a node.js program that takes json messages, translates them into OSC messages, and sends them out to a port.
It uses a fork of osc4nodeServer (https://github.com/hideyukisaito/osc4node).

FIRST: You need node.js, espress, socket.io, and ws 

To run the program:
node json2OSC.js listen-port# send-port#
   where listen-port# will be used for incoming json messages to be translated and delivered to send-port#. 

Of course you will need:
	a) a synth to receive the OSC messages on send-port#
	b) a message source sending json messages to listen-port#
 

------- 

To see json2OSC in action, try it with the demo_app client (included in this project) as a message source.

   0) run json2OSC as above, 
   1) start demo_app/maxPatches/printOSC.maxpat (need MAx from Cycling74.com , free 30 day trials available) or any OSC receiver,
		a) make sure the patch is listening on send-port#
		b) open the max window to see the messages printed out
		
   2) go to demo_app subdirectory and run
	>> node demoserver.js server-port#

   3) open a browser, point to localhost:server-port#
	a) configure 
	b) send messages

-------

Better yet, grap the oscSurface (messageSurface) project on GitHub and use it to design rich interfaces for controlling OSC synths using json2osc.

-------
lonce.wyse@zwhome.org


