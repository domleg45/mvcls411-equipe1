import { defaultContentType, videoArray } from "./videos";
import { elements } from "./htmlElements";

const clickEventValue: string = 'click';
let currentSession;
let currentMediaSession;
let isPlaying: boolean = true;
let currentVideoIndex: number = 0;
let lastVolumeLevel: number = 1;

const connectionNotEstablishedError = (): void => {
    alert('Connectez-vous sur chromecast en premier');
}

function onInitSuccess() {
    console.log('Chromecast init success');
}

function onError(error: string) {
    console.error('Chromecast initialization error', error);
}

function onMediaCommandSuccess() {
    console.log('Media command success');
}

elements.castButton?.addEventListener(clickEventValue, () => {
    initializeApiOnly();
});

elements.startButton?.addEventListener(clickEventValue, () => {
    if (currentSession) {
        if(localStorage.getItem('currentVideoIndexLS')) {
            loadMedia(videoArray[localStorage.getItem('currentVideoIndexLS')]);
        } else connectionNotEstablishedError();
        
        
       
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

elements.nextVideoButton?.addEventListener(clickEventValue, () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex + 1) % videoArray.length;
        localStorage.setItem('currentVideoIndexLS', currentVideoIndex.toString());
        loadMedia(videoArray[currentVideoIndex]);
    } else connectionNotEstablishedError();
});

elements.previosVideoButton?.addEventListener(clickEventValue, () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex - 1) % videoArray.length;
        localStorage.setItem('currentVideoIndexLS', currentVideoIndex.toString());
        loadMedia(videoArray[currentVideoIndex]);
    } else connectionNotEstablishedError();
});

elements.playPauseButton?.addEventListener(clickEventValue, () => {
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
    elements.startButton.style.display = 'block';
    elements.nextVideoButton.style.display = 'block';
    elements.previosVideoButton.style.display = 'block';
}


function initializeMuted(remotePlayerController, remotePlayer, mediaSession) {
    //Ajout listener + boutton
    muteToggle?.addEventListener('click', () => {
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
    elements.playPauseButton.style.display = 'block';
 }

function receiverListener(availability) {
    if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
        elements.castButton.style.display = 'block';
    } else {
        elements.castButton.style.display = 'none';
    }
}

function initializeApiOnly() {
    const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
    const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function loadMedia(videoUrl: string) {
    const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, defaultContentType);
    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
        initializeMediaSession(mediaSession);
        initializeMuted(mediaSession);
      }, onError);
}
