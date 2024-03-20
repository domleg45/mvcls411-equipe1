let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
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

const castButton = document.getElementById('cast_connect');
const nextButton = document.getElementById('next_button');
const previousBtn = document.getElementById('previousBtn');
const playButton = document.getElementById('play_button');

castButton.addEventListener('click', () => {
    initializeApiOnly();
});

nextButton.addEventListener('click', () => {
    if (currentSession) {
        //localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        changeVideo(undefined, true);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

previousBtn.addEventListener('click', () => {
    if (currentSession) {
        //localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        changeVideo(undefined, false);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

playButton.addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        }

        isPlaying = !isPlaying;
    }
});


function sessionListener(newSession) {
    currentSession = newSession;
    nextButton.style.display = 'block';
    previousBtn.style.display = 'block';
    loadMedia(currentVideoIndex, undefined);
}


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

function loadMedia() {
    const mediaInfo = new chrome.cast.media.MediaInfo(videoList[currentVideoIndex], defaultContentType);
    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
        initializeMediaSession(mediaSession);
        initializeMuted(mediaSession);
    }, onError);
}

function changeVideo(videoIndex, isNext) {
    if (videoIndex) {
        currentVideoIndex = videoIndex;
    } else {
        if (isNext) {
            currentVideoIndex++;
            if (currentVideoIndex >= videoList.length) currentVideoIndex = 0;
        } else {
            currentVideoIndex--;
            if (currentVideoIndex < 0) currentVideoIndex = videoList.length - 1;
        }
    }

    loadMedia();
    console.log(currentVideoIndex);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}