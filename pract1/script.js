var video, chapterMenuDiv;
var progress
var tracks, trackElems;

window.onload = function () {
    //inicializamos las variables
    progress = document.getElementById("progress");
    chapterMenuDiv = document.querySelector("#chapterMenu");
    trackElems = document.querySelectorAll("track");
    video = document.querySelector("#myVideo");

    //Creamos un evento que nos cargue caga vez que el tiempo del video cambia
    //lo utilizamos para actualizar nuestra barra de progresso
    video.ontimeupdate = function () {
        var total = (video.currentTime * 100) / video.duration;
        progress.style.width = total + "%";
    };

    // Obtenemos todos los tracks
    tracks = video.textTracks;
    buildChapterMenu('chapters');
};

function buildChapterMenu(kind) {
    // localizamos los tracks con kind="chapters"
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        var trackAsHtmlElem = trackElems[i];
        if ((track.kind === kind)) {
            // current chapter while the video is playing
            track.mode = "showing";
            trackAsHtmlElem.addEventListener('load', function (e) {
                displayChaptersMarkers(track);
            });
        }
    }
}

function displayChaptersMarkers(track) {
    var cues = track.cues;

    // We should not see the cues on the video.
    track.mode = "hidden";

    for (var i = 0, len = cues.length; i < len; i++) {
        var cue = cues[i];
        var cueObject = JSON.parse(cue.text);
        var description = cueObject.description;
        var imageFileName = cueObject.image;
        var imageURL = imageFileName;
        // añadimos las imagenes
        var figure = document.createElement('figure');
        figure.classList.add("img");
        console.log(cue);
        figure.innerHTML = "<img onclick='jumpTo(" + cue.startTime + ");'  class='thumb' src='" + imageURL + "'><figcaption class='desc'>" + description + "</figcaption></figure>";
        chapterMenuDiv.insertBefore(figure, null);
    }
}

function jumpTo(time) {
    video.currentTime = time;
    video.play();
}


function playPause() {

    if (video.paused)
        video.play();
    else
        video.pause();
}

function reset() {
    video.currentTime = 0;
}

function muted() {

    if (!video.muted) {
        video.muted = true;
    } else {
        video.muted = false;
    }
}

function setVolumen(value) {
    video.volume = value / 100;
}


