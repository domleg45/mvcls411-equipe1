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

document.getElementById('cast_connect').addEventListener('click', () => {
    initializeApiOnly();
});



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

document.getElementById('play_button').addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
            document.getElementById("play_button").setAttribute('src','../images/pause.png');
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
            document.getElementById("play_button").setAttribute('src','../images/play.png');
        }
        isPlaying = !isPlaying;
    }
});


function sessionListener(newSession) {
    currentSession = newSession;
    document.getElementById('start_button').style.display = 'block';
    document.getElementById('next_button').style.display = 'block';
    document.getElementById('previousBtn').style.display = 'block';
}


let isMuted = false;
document.getElementById('muteBtn').addEventListener('click', () => {
    if (currentSession) {
        isMuted = !isMuted;
        currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
    }
});

document.getElementById('volUp').addEventListener('click', () => {
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(currentSession.receiver.volume.level += 0.1, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
document.getElementById('volDown').addEventListener('click', () => {
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(currentSession.receiver.volume.level -= 0.1, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});



function initializeSeekSlider(remotePlayerController, mediaSession) {
    currentMediaSession = mediaSession;
    document.getElementById('play_button').style.display = 'block';
   // Set max value of seek slider to media duration in seconds
   seekSlider.max = mediaSession.media.duration;

    updateInterval = setInterval(() => {
        const currentTime = mediaSession.getEstimatedTime();
        const totalTime = mediaSession.media.duration;
  
        seekSlider.value = currentTime;
        currentTimeElement.textContent = formatTime(currentTime);
        totalTimeElement.textContent = formatTime(totalTime);
      }, 1000); //chaque 1000 ms... 1 sec
  
      // slider change
      seekSlider.addEventListener('input', () => {
        const seekTime = parseFloat(seekSlider.value);
        remotePlayerController.seek(seekTime);
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
        document.getElementById('cast_connect').style.display = 'block';
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
    const remotePlayer = new cast.framework.RemotePlayer();
    const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
        initializeSeekSlider(remotePlayerController, mediaSession);
    }, onError);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}