let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
let currentVideoUrl;
let updateInterval;
let lastVolumeLevel = 1;
const muteToggle = document.getElementById('muteToggle');
const defaultContentType = 'video/mp4';
const videoList = [
    'https://transfertco.ca/video/DBillPrelude.mp4',
    'https://transfertco.ca/video/DBillSpotted.mp4',
    'https://transfertco.ca/video/usa23_7_02.mp4'
];

/**
 * ---------------------------------------------------------------------------------------------------
 * Partie Connection et initialisation de la vidéo
 */


/**
 * Connection
 * Aucun changement, c'est la même fonction que celle de base.
 */
document.getElementById('cast_connect').addEventListener('click', () => {
    initializeApiOnly();
});
/**
 * Start
 * Boutton pour start la vidéo. Vidéo prédéfini.
 * Aucun changement, c'est la même fonction que celle de base.
 */
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
/**
 * ---------------------------------------------------------------------------------------------------
 * Partie Next / Previous
 * Aucun changement, c'est la même fonction que celle de base.
 */


/**
 * Next
 */
document.getElementById('next_button').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
/**
 * Previous
 */
document.getElementById('previousBtn').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
        localStorage.setItem('currentVideoIndexLS', currentVideoIndex);
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
/**
 * ---------------------------------------------------------------------------------------------------
 * Partie Play / Pause
 * J'ai fait un changement de séparé le play et le pause en deux fonction distinct.
 */


/**
 * Play
 * Boutton pour play la vidéo.
 * Karolann est aller le chercher dans le code qu'elle avait conçu pour sa télécommande.
 * Il avait seulement une légère différence avec celle de base.
 */
document.getElementById('play_button').addEventListener('click', () => {
    if (currentMediaSession) {
        if (!isPlaying) {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
    }
});
/**
 * Pause
 * Boutton pour pause la vidéo.
 * Karolann est aller le chercher dans le code qu'elle avait conçu pour sa télécommande.
 * Il avait seulement une légère différence avec celle de base.
 */
document.getElementById('pause_button').addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
    }
});

/**
 * ---------------------------------------------------------------------------------------------------
 * Partie Seek Volume avec boutton
 */


/**
 * Mute
 * Boutton pour mute le volume.
 * Karolann est aller le chercher dans le code qu'elle avait conçu pour sa télécommande.
 * Il y a un changement visuel sur le ChromeCast lorsqu'on appuie sur le boutton/icon.
 * L'aspect visuel est un plus du pourquoi Karolann a changer la fonction mute.
 * De plus, l'ancienne fonction mute, lorsqu'on clickait sur le boutton il y avait un mini freeze de la manette.
 */
let isMuted = false;
document.getElementById('muteToggle').addEventListener('click', () => {
    if (currentSession) {
        isMuted = !isMuted;
        currentSession.setReceiverMuted(isMuted, onMediaCommandSuccess, onError);
    }
});
/**
 * Volume +
 * Boutton pour augmenter le volume.
 * Karolann est aller le chercher dans le code qu'elle avait conçu pour sa télécommande.
 * Il y a un changement visuel sur le ChromeCast lorsqu'on appuie sur le boutton/icon.
 */
document.getElementById('volumeUpBtn').addEventListener('click', () => {
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(currentSession.receiver.volume.level += 0.1, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});
/**
 * Volume -
 * Boutton pour baisser le volume. 
 * Karolann est aller le chercher dans le code qu'elle avait conçu pour sa télécommande.
 * Il y a un changement visuel sur le ChromeCast lorsqu'on appuie sur le boutton/icon.
 */
document.getElementById('volumeDownBtn').addEventListener('click', () => {
    if (currentSession) {
        currentSession.setReceiverVolumeLevel(currentSession.receiver.volume.level -= 0.1, onMediaCommandSuccess, onError);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

function sessionListener(newSession) {
    currentSession = newSession;
    document.getElementById('start_button').style.display = 'block';
    document.getElementById('next_button').style.display = 'block';
    document.getElementById('previousBtn').style.display = 'block';
}

//Changement du display dans le else pour none -> block
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

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
        initializeMediaSession(mediaSession);
        initializeMuted(mediaSession);
      }, onError);
}