var selfEasyrtcid = "";

function connect() {
    easyrtc.setSocketUrl("", {
        "connect timeout": 10000,
        "force new connection": true,
        "path": '/gdie02b/socket.io'
    });
    easyrtc.setUseFreshIceEachPeerConnection(true);
    easyrtc.setVideoDims(1280, 720);
    easyrtc.enableDebug(true);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.easyApp("easyrtc.videoChatHd", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
}


function clearConnectList() {
    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}


function convertListToButtons(roomName, data, isPrimary) {
    clearConnectList();
    var otherClientDiv = document.getElementById('otherClients');
    for (var easyrtcid in data) {
        var button = document.createElement('button');
        button.onclick = function (easyrtcid) {
            return function () {
                performCall(easyrtcid);
            };
        }(easyrtcid);

        var label = document.createTextNode(easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        button.className = "callbutton";
        otherClientDiv.appendChild(button);
    }
}


function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    var acceptedCB = function (accepted, caller) {
        if (!accepted) {
            easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(caller) + " was rejected");
        }
    };
    var successCB = function () { };
    var failureCB = function () { };
    easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = easyrtc.cleanId(easyrtcid);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}


// Sets calls so they are automatically accepted (this is default behaviour)
easyrtc.setAcceptChecker(function (caller, cb) {
    cb(true);
});
