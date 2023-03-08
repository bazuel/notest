

let recordingIconInterval = 0;

export function disableRecordingIcon() {
    clearInterval(recordingIconInterval);
    chrome.action.setIcon({path: '/assets/icon-128.png'});
}
export function enableRecordingIcon() {
    let active = true;
    recordingIconInterval = setInterval(() => {
        if (active) chrome.action.setIcon({ path: "/assets/recording.png" });
        else chrome.action.setIcon({ path: "/assets/recording-active.png" });
        active = !active;
    }, 1000);
}
