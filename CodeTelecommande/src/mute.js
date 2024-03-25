const volumePlus = document.getElementById("volume-plus");
const volumeLess = document.getElementById("volume-less");
const volumeValue = document.getElementById("volume-value");
const volumeMute = document.getElementById("volume-mute");

/* 
    Code qui provient du projet chrome-cast de moi et Davide, sauf que je l'ai plus optimiser.
    https://github.com/AD6F/html-controller
*/
let currentVolume;
let volumeRequest;
let volumeLevel = 100;
let isMuted = false;

const changeVolume = () => {
    currentVolume = new chrome.cast.Volume((isMuted ? 0 : Number.parseFloat(volumeLevel / 100)), isMuted);
    volumeRequest = new chrome.cast.media.VolumeRequest(currentVolume);
    currentMediaSession.setVolume(volumeRequest);

    // Give to the HTML p
    if (isMuted) volumeValue.innerText = "mute";
    else volumeValue.innerText = volumeLevel;
};

const notMuteOperation = () => {
    if (isMuted) isMuted = false;
    changeVolume()
};

volumePlus.onclick = () => {
    if (volumeLevel < 100) volumeLevel += 10;
    notMuteOperation();
};

volumeLess.onclick = () => {
    if (volumeLevel > 0) volumeLevel = volumeLevel - 10;
    notMuteOperation();

};

volumeMute.onclick = () => {
    isMuted = !isMuted;
    changeVolume();
};

/**
 * Fin du code provenant du projet chrome-cast de moi et Davide modifié.
*/