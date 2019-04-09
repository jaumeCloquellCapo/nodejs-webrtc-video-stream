// Load required modules
var http = require("http");              // http server core module
var https = require('https');
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var easyrtc = require('./lib/easyrtc_server');              // EasyRTC external module
var path = require("path");
// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();
app.get('/', function(req, res) {
        res.redirect('https://alumnes-ltim.uib.es/gdie02b/1/')
 });
app.use('/1',serveStatic('pract1', { 'index': ['index.html'] }));
app.use('/2',serveStatic('public', { 'index': ['index.html'] }));
app.use('/3',serveStatic('pract2', { 'index': ['index.html'] }));

/*app.use(serveStatic('api'));
app.use(serveStatic('lib'));
app.use(serveStatic('node_modules'));*/
//.use('/1',serveStatic('primeraPract', {'index': ['index.html']}));


var port = process.env.PORT || 8080;
// Start Express http server on port 8080
var webServer = http.createServer(app).listen(port);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, { "log level": 1 });

//This is for to connect a turn server
var myIceServers = [
    {
        "url": "stun:numb.viagenie.ca"
    },
    {
        "url": "turn:numb.viagenie.ca",
        "username": "jaumecloquell1995@gmail.com",
        "credential": "123456789"
    },
    {
        "url": "turn:numb.viagenie.ca?transport=tcp",
        "username": "jaumecloquell1995@gmail.com",
        "credential": "123456789"
    }
];

easyrtc.setOption("appIceServers", myIceServers);

easyrtc.setOption("logLevel", "none");

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function (socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function (err, connectionObj) {
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, { "isShared": false });

        console.log("[" + easyrtcid + "] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function (connectionObj, roomName, roomParameter, callback) {
    console.log("[" + connectionObj.getEasyrtcid() + "] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function (err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function (appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

//listen on port 8080
webServer.listen(8080, function () {
    console.log('listening on http://localhost:' + port);
});
