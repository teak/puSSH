const electron = require('electron');
const app = electron.remote.app;
const ipc = electron.ipcRenderer;
const shell = electron.shell;

const path = require('path');

const tink = new Audio(path.join(app.getAppPath(), 'aud', 'ts-tink.ogg'));
const thisWindow = electron.remote.getCurrentWindow();

const Positioner = require('electron-positioner');
const positioner = new Positioner(thisWindow);

let richNotifyTimer = null;

ipc.on('audio-notify', () => {
    tink.load();
    tink.play();
});

ipc.on('system-notify', (evt, body, url) => {
    const notify = new Notification('Pussh', {
        body: body,
        silent: true
    });

    if (!url) return;
    notify.onclick = () => shell.openExternal(url);
});

ipc.on('rich-notify', (evt, body, url) => {
    document.getElementById('back-img').style.backgroundImage = 'url(' + url + ')';
    document.getElementById('body-text').innerHTML = body;
    document.getElementById('open-button').onclick = function() {
        shell.openExternal(url);
    };
    document.getElementById('close').onclick = function() {
        thisWindow.hide();
    };


    let newPos = positioner.calculate('topRight');
    newPos.x -= 20;
    newPos.y += 20;
    thisWindow.setPosition(newPos.x, newPos.y)

    thisWindow.show();

    clearTimeout(richNotifyTimer);
    richNotifyTimer = setTimeout(() => {
        thisWindow.hide();
    }, 10000);
});
