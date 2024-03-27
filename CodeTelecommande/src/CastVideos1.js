let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
let updateInterval;
let lastVolumeLevel = 1;

const IMAGE_PATH = "../assets/img";

const videoList = [
    'https://transfertco.ca/video/DBillPrelude.mp4',
    'https://transfertco.ca/video/DBillSpotted.mp4',
    'https://transfertco.ca/video/usa23_7_02.mp4'
];

const defaultContentType = 'video/mp4';
const seekSlider = document.getElementById('seekSlider');
const currentTimeElement = document.getElementById('currentTime');
const totalTimeElement = document.getElementById('totalTime');
const castButton = document.getElementById('cast_connect');
const nextButton = document.getElementById('next_button');
const previousBtn = document.getElementById('previousBtn');
const playButton = document.getElementById('play_button');
const volumeMute = document.getElementById("volume-mute");
const DISABLED = "disabled-button";
const EMPTY = "";

function isCastInit() {
    if (currentMediaSession) return true;
    else {
        alert("Connectez-vous sur chromecast en premier");
        return false;
    }
}

function closeButton() {
    playButton.className = DISABLED;
    nextButton.className = DISABLED;
    previousBtn.className = DISABLED;
    playButton.className = DISABLED;
    volumeMute.className = DISABLED;
}

closeButton();

function initButton() {
    playButton.className = EMPTY;
    nextButton.className = EMPTY;
    previousBtn.className = EMPTY;
    playButton.className = EMPTY;
    volumeMute.className = EMPTY;
}

castButton.onclick = () => {
    initializeApiOnly();
};

nextButton.onclick = () => {
    if (isCastInit()) {
        //localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        changeVideo(undefined, true);
    }
};

previousBtn.onclick = () => {
    if (isCastInit()) {
        //localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        changeVideo(undefined, false);
    }
};

playButton.onclick = () => {
    if (isCastInit()) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
            playButton.src = `${IMAGE_PATH}/pause.png`;
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
            playButton.src = `${IMAGE_PATH}/play.png`;
        }

        isPlaying = !isPlaying;
    }
};


function sessionListener(newSession) {
    currentSession = newSession;
    nextButton.style.display = 'block';
    previousBtn.style.display = 'block';
    loadMedia();
    initButton();
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