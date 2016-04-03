var remote = require('remote');
var app = remote.require('app');
var ipc = require('ipc');
var shell = require('shell');
var path = require('path');
var fs = require('fs');

var tink = new Audio(path.join(app.getAppPath(), 'aud', 'ts-tink.ogg'));

ipc.on('audio-notify', function(message) {
    tink.load();
    tink.play();
});


Notification.requestPermission();

ipc.on('unix-notify', function(message) {
    var notify = new Notification('Pussh', {
        body: message.body
    });

    if (message.url) {
        notify.onclick = function() {
            shell.openExternal(message.url);
        };
    } 
});
