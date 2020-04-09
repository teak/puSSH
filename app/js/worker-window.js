const { remote, ipcRenderer, shell } = require('electron');
const { app, screen, clipboard } = remote;

const path = require('path');

const tink = new Audio(path.join(app.getAppPath(), 'aud', 'ts-tink.ogg'));
const thisWindow = remote.getCurrentWindow();

let richNotifyTimer = null;

ipcRenderer.on('audio-notify', () => {
    tink.load();
    tink.play();
});

ipcRenderer.on('system-notify', (evt, body, url) => {
    const notify = new Notification('Pussh', {
        body: body,
        silent: true
    });

    if (!url) return;
    notify.onclick = () => shell.openExternal(url);
});

ipcRenderer.on('rich-notify', (evt, body, url) => {
    document.getElementById('back-img').style.backgroundImage = 'url(' + url + ')';
    document.getElementById('body-text').innerHTML = body;

    // restart progress indicator
    let progress = document.getElementById('progress');
    let newProgress = progress.cloneNode(true);
    progress.parentNode.replaceChild(newProgress, progress);

    document.getElementById('open-button').onclick = function() {
        shell.openExternal(url);
    };

    document.getElementById('close').onclick = function() {
        thisWindow.hide();
    };

    document.getElementById('ocr-button').onclick = function() {
        ipcRenderer.send('run-ocr');
    };

    let displaySize = screen.getPrimaryDisplay().bounds;
    let windowSize = thisWindow.getSize();

    thisWindow.setPosition(displaySize.width - windowSize[0] - 20, 42);
    thisWindow.show();

    clearTimeout(richNotifyTimer);
    richNotifyTimer = setTimeout(() => {
        thisWindow.hide();
    }, 7000);
});
