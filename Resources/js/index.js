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
    this.version = gui.App.manifest.version;
    this.window = gui.Window.get();

    this.services = new Services(this);

    this.watch();
    this.setupTray();
}

Pussh.prototype.setupTray = function() {
    var _self = this;

    var tray = new gui.Tray({
        title: 'pussh',
        icon: '../img/icon.png'
    });

    var menu = new gui.Menu();

    // open settings
    menu.append(new gui.MenuItem({
        label: 'Settings',
        click: function() {
            var settingsWindow = gui.Window.open('settings-window.html', {
                "focus": true,
                "toolbar": true,
                "width": 800,
                "height": 600
            });
            // window.location = 'settings-window.html';
            // _self.window.show();
            // _self.window.focus();
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
    var _self = this;

    var desktopFolder = path.join(process.env['HOME'], 'Desktop');
    
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
    var _self = this;

    var selectedAuth = _self.settings.get('authModule');
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
    var _self = this;

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
    var _self = this;

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
