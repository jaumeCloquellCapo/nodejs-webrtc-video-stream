var selfEasyrtcid = "";
var reconocimientoTexto = "";
var video;
var recording = false;

function detectLang() {
    var lang = window.navigator.languages ? window.navigator.languages[0] : null;
    lang = lang || window.navigator.language || window.navigator.browserLanguage || window.navigator.userLanguage;
    if (lang.indexOf('-') !== -1)
        lang = lang.split('-')[0];
    if (lang.indexOf('_') !== -1)
        lang = lang.split('_')[0];
    var voice = 'UK English Female';
    switch (lang) {
        case 'en':
            voice = "UK English Female";
            break;
        case 'es':
            voice = "Spanish Female";
            break;
        case 'fr':
            voice = "French Female";
            break;
        default:
            voice = "UK English Female";
            break;
    }
    return voice
}


function speak(text) {
    if (responsiveVoice.voiceSupport()) {
        var lang = detectLang()
        responsiveVoice.speak(text, lang);
    }
}

var normalize = (function () {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
        to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
        mapping = {};

    for (var i = 0, j = from.length; i < j; i++)
        mapping[from.charAt(i)] = to.charAt(i);

    return function (str) {
        var ret = [];
        for (var i = 0, j = str.length; i < j; i++) {
            var c = str.charAt(i);
            if (mapping.hasOwnProperty(str.charAt(i)))
                ret.push(mapping[c]);
            else
                ret.push(c);
        }
        return ret.join('');
    }

})();

var myCommand = {
    hola: function () {
        //alert('hola')
        speak('Hola cariño')
        //go to the next post
        //this.writeCommand("siguiente");
    },
    madrid: function () {
        //alert('hola')
        window.location.replace('http://tv.giphy.com/?username=fcbarcelona');
        //go to the next post
        //this.writeCommand("siguiente");
    },
    adios: function () {
        //alert('adios')
        speak('Adios guapi')
        //speak('hasta pronto amor')
        //go to previous post
    },
    reproducir: function () {
        alert('reproducir')
        if (video.paused)
            video.play();
        else
            video.pause();
        //go to previous post
    },
    parar: function () {
        if (video.paused)
            video.play();
        else
            video.pause();
        //go to previous post
    },
    reset: function () {
        video.currentTime = 0;
    },
    silencio: function () {
        if (!video.muted) {
            video.muted = true;
        } else {
            video.muted = false;
        }
    }
}

function connect() {
    //inicializar variables
    video = document.querySelector("#myVideo");

    // speak("Bienvenido a la página oficial del rey del futbol")
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        // Obtenemos el objeto de reconocimento de texto de forma compatible a diferentes navegadores
        reconocimientoTexto = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        // reconocimientoTexto.continuous = false;
        reconocimientoTexto.lang = "es-ES"
        reconocimientoTexto.continuous = true;
        reconocimientoTexto.interimResults = true;
        reconocimientoTexto.isFinal = true;
        reconocimientoTexto.onresult = function (event) {
            // Mostramos el texto obtenido
            for (var i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    var string = normalize(event.results[i][0].transcript.toLowerCase())
                    eval("myCommand." + string + "()");
                }
            }
        }
        // Empezamos a reconocer texto
        //recordVoice()
        //reconocimientoTexto.start();
    } else {
        //alert('error')
        speak("Tu navegador no soporta la libreria de reconocimiento de voz")
    }

    easyrtc.setSocketUrl("", {
        "connect timeout": 10000,
        "force new connection": true,
        "path": '/gdie02b/socket.io'
        //"path": '/socket.io'
    });
    easyrtc.setUseFreshIceEachPeerConnection(true);
    easyrtc.setVideoDims(1280, 720);
    easyrtc.enableDebug(true);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.easyApp("easyrtc.videoChatHd", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);

}

function recordVoice() {
    recording = !recording
    recording ? reconocimientoTexto.start() : reconocimientoTexto.stop()
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
    var successCB = function () {

    };
    var failureCB = function () { };
    easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    speak("Mi codigo para la videoconferencia es " + easyrtcid)
    document.getElementById("iam").innerHTML = easyrtc.cleanId(easyrtcid);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}


// Sets calls so they are automatically accepted (this is default behaviour)
easyrtc.setAcceptChecker(function (caller, cb) {
    cb(true);
});
