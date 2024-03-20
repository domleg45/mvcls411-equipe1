let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
let currentVideoUrl;
let updateInterval;
let lastVolumeLevel = 1;
const muteToggle = document.getElementById('muteToggle');
const defaultContentType = 'video/mp4';
const seekSlider = document.getElementById('seekSlider');
const currentTimeElement = document.getElementById('currentTime');
const totalTimeElement = document.getElementById('totalTime');
const videoList = [
    'https://transfertco.ca/video/DBillPrelude.mp4',
    'https://transfertco.ca/video/DBillSpotted.mp4',
    'https://transfertco.ca/video/usa23_7_02.mp4'
];

//Connection
document.getElementById('cast_connect').addEventListener('click', () => {
    initializeApiOnly();
});
//Start 
document.getElementById('start_button').addEventListener('click', () => {
    if (currentSession) {
        if(localStorage.getItem('currentVideoIndexLS')) {
            loadMedia(videoList[localStorage.getItem('currentVideoIndexLS')]);
        } else {
            loadMedia(videoList[currentVideoIndex]);
        }
        
       
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

//NEXT / PREVIOUS
document.getElementById('next_button').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('previousBtn').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
        localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

//PLAY / PAUSE
document.getElementById('play_button').addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
    }
});
//NEW PLAY / PAUSE vient de moi
document.getElementById('playBtn').addEventListener('click', () => {
    if (currentMediaSession) {
        if (!isPlaying) {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        isPlaying = !isPlaying;
        }
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
    }
});

//Volume

//New mute function. Elle est meilleur que la précédente, car quand on click sur le button, il a pas de freeze et nous voyons avec l'état de volume sur la vidéo elle est mute.
//Je suis allé la chercher dans mon propre code de télécommande.
let isMuted = false;
document.getElementById('muteToggle').addEventListener('click', () => {
    if (currentSession) {
        isMuted = !isMuted;
        currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
    }
});

//Volume +

//Volume -


function sessionListener(newSession) {
    currentSession = newSession;
    document.getElementById('start_button').style.display = 'block';
    document.getElementById('next_button').style.display = 'block';
    document.getElementById('previousBtn').style.display = 'block';
}

//Doit faire diff mute note à moi-même
function initializeMuted(remotePlayerController, remotePlayer, mediaSession) {
    //Ajout listener + boutton
    muteToggle.addEventListener('click', () => {
        if (currentMediaSession.volume.muted) {
            // Unmute
            const volume = new chrome.cast.Volume(lastVolumeLevel, false);
            const volumeRequest = new chrome.cast.media.VolumeRequest(volume);
            currentMediaSession.setVolume(volumeRequest, onMediaCommandSuccess, onError);
        } else { 
            
            
            lastVolumeLevel = currentMediaSession.volume.level;
            // Mute
            const volume = new chrome.cast.Volume(0, true);
            const volumeRequest = new chrome.cast.media.VolumeRequest(volume);
            currentMediaSession.setVolume(volumeRequest, onMediaCommandSuccess, onError);
        }
    });
}





function initializeMediaSession(mediaSession) {
    currentMediaSession = mediaSession;
    document.getElementById('play_button').style.display = 'block';
 }

function receiverListener(availability) {
    if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
        document.getElementById('cast_connect').style.display = 'block';
    } else {
        document.getElementById('cast_connect').style.display = 'none';
    }
}

function onInitSuccess() {
    console.log('Chromecast init success');
}

function onError(error) {
    console.error('Chromecast initialization error', error);
}

function onMediaCommandSuccess() {
    console.log('Media command success');
}

function initializeApiOnly() {
    const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
    const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function loadMedia(videoUrl) {
    currentVideoUrl = videoUrl;
    const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, defaultContentType);
    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
        initializeMediaSession(mediaSession);
        initializeMuted(mediaSession);
      }, onError);
}