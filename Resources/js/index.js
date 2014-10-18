var exec = require('child_process').exec;
var fs = require('fs');
var gui = require('nw.gui');
var os = require('os');
var path = require('path');
var watch = require('watch');

var Settings = require('./js/settings');
var Services = require('./js/services');

function Pussh() {
    this.settings = new Settings();
    this.version = require('../package.json').version;

    this.services = new Services(this);

    this.watch();
    this.setupTray();
}

Pussh.prototype.setupTray = function() {
    var tray = new gui.Tray({
        icon: '../img/icon.png'
    });

    var menu = new gui.Menu();

    // open settings
    menu.append(new gui.MenuItem({
        label: 'Settings',
        click: function() {
            //Window.show();
            //Window.focus();
            // TODO: make a new window popup that references this Pussh object
        }
    }));

    // quit app
    menu.append(new gui.MenuItem({
        label: 'Quit Pussh',
        click: function() {
            gui.App.quit();
        }
    }));

    tray.menu = menu;
}

// TODO: Watching for screenshots works on OSX, but what about Windows/*nix
Pussh.prototype.watch = function() {
    var desktopFolder = path.join(process.env['HOME'], 'Desktop');

    var _self = this;
    watch.createMonitor(desktopFolder, function(monitor) {
        monitor.on("created", function(file) {
            exec('/usr/bin/mdls --raw --name kMDItemIsScreenCapture "'+file+'"', function(error, stdout) {
                if(error) return;

                if(!parseInt(stdout)) return; // 1 = screenshot, 0 = not a screenshot

                _self.upload(file);
            });
        });
    });
}

// Uploads a new file
// TODO: Tray icon status change to uploading
Pussh.prototype.upload = function(file) {
    var selectedAuth = _self.settings.get('authModule');

    var _self = this;
    this.resize(file, function() {
        _self._authModules[selectedAuth].upload(file, function(url) {
            _self.trash(file);
            _self.copyToClipboard(url);
            // TODO: Completion sound
        });
    });
}

// Trash file after upload
Pussh.prototype.trash = function(file) {
    if(_self.settings.get('sendToTrash') === false) return;

    var trashFolder;

    switch(os.platform()) {
        case 'win32':
            trashFolder = path.join(process.env['SystemRoot'], '$Recycle.bin', process.env['SID']);
            break;
        case 'darwin':
            trashFolder = path.join(process.env['HOME'], '.Trash');
            break;
        case 'linux':
            trashFolder = path.join(process.env['HOME'], '.local', 'share', 'Trash');
            break;
        default:
            return;
    }

    // We could just delete the file, but what if the user wants it back
    fs.rename(file, path.join(trashFolder, path.basename(file)));
}

// Retina screens cause issues, so we give the option to resize
Pussh.prototype.resize = function(file, callback) {
    if(os.platform() !== 'darwin' || _self.settings.get('retinaResize') === false) return callback();

    exec('/usr/bin/sips -g dpiWidth -g pixelWidth "'+file+'"', function(error, stdout) {
        if(error) return callback();

        var lines = stdout.split('\n');

        var dpiWidth = parseFloat(lines[0].split(':')[1].trim());
        var pixelWidth = parseInt(lines[1].split(':')[1].trim());

        if(parseInt(dpiWidth) === 72) return callback();

        var newWidth = Math.round((72 / dpiWidth) * pixelWidth);

        exec('/usr/bin/sips --resampleWidth '+newWidth+' "'+file+'"', function(error, stdout) {
            callback();
        });
    });
}

// Copy url to clipboard after upload
Pussh.prototype.copyToClipboard = function(url) {
    var clipboard = gui.Clipboard.get();

    clipboard.set(url);
}

window.Pussh = new Pussh();
