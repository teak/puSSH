var app = require('app');
var os = require('os');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var request = require('request');

var BrowserWindow = require('browser-window');
var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
var NativeImage = require('native-image');
var globalShortcut = require('global-shortcut');

var clipboard = require('clipboard');
var shell = require('shell');
var ipc = require('electron').ipcMain;

var Settings = require('./settings');
var Services = require('./services');

function Pussh() {
    this.platform = os.platform();
    this.name = app.getName();
    this.version = app.getVersion();
    this.lastURL = '';

    this.settingsWindow = null;
    this.editorWindow = null;
    this.workerWindow = null;
    this.cropWindow = null;

    var _self = this;

    // open hidden window to provide access to dom only apis
    _self.workerWindow = new BrowserWindow({show: false});
    _self.workerWindow.loadURL('file://' + path.join(app.getAppPath(), 'worker-window.html'));
    _self.workerWindow.webContents.on('did-finish-load', function() {
        // worker window needs to be loaded first

        _self.settings = new Settings(_self);
        _self.services = new Services(_self);

        _self.watch();
        _self.buildTrayMenu();
        _self.firstLaunch();
        _self.checkUpdates();
    });

    // hide the dock icon on os x
    if (_self.platform == 'darwin') {
        app.dock.hide();
    }

    // open settings on app activate
    app.on('activate', function() {
        _self.showSettingsWindow();
    });

    // keep the app open when closing the last window
    app.on('window-all-closed', function() {
        _self.settingsWindow = null;
        _self.editorWindow = null;
        _self.workerWindow = null;
        _self.cropWindow = null;
    });

    // unregister global hotkeys before quit
    app.on('will-quit', function() {
        globalShortcut.unregisterAll();
    });

    // get the status item icon
    var trayImg = NativeImage.createFromPath(path.join(app.getAppPath(), 'img', 'menu-icon.png'));
    if (_self.platform == 'win32') {
        trayImg = NativeImage.createFromPath(path.join(app.getAppPath(), 'img', 'menu-alt-icon.png'));
    }
    trayImg.setTemplateImage(true);

    // create status item
    _self.tray = new Tray(trayImg);
    _self.tray.setPressedImage(path.join(app.getAppPath(), 'img', 'menu-alt-icon.png'));

    // handle clicking on the notification (windows only)
    _self.tray.on('balloon-click', function() {
        _self.openInBrowser(_self.lastURL);
    });
}

Pussh.prototype.firstLaunch = function() {
    var _self = this;

    if (_self.settings.get('lastVersionLaunched') != _self.version) {
        _self.showSettingsWindow();

        _self.settings.set('lastVersionLaunched', _self.version);
    }
}

Pussh.prototype.checkUpdates = function() {
    var _self = this;

    if (!_self.settings.get('checkForUpdates')) return;

    request('http://pussh.me/dl/pussh.json', function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);

            if (!data.version) return;

            if (_self.version != data.version) {

                var msg = 'Pussh has an available update. Click "OK" to open the Pussh download page...';
                if (confirm(msg)) {
                    _self.openInBrowser('http://pussh.me/');
                }
            }
        }
    });
}

Pussh.prototype.showSettingsWindow = function() {
    var _self = this;

    if (_self.settingsWindow) {
        _self.settingsWindow.focus();
    } else {
        _self.settingsWindow = new BrowserWindow({
            "show": false,
            "width": 900,
            "height": 600,
            "minWidth": 900,
            "minHeight": 580,
            "skip-taskbar": true,
            "auto-hide-menu-bar": true
        });

        _self.settingsWindow.loadURL('file://' + path.join(app.getAppPath(), 'settings-window.html'));

        _self.settingsWindow.on('closed', function() {
            _self.settingsWindow = null;
        });

        _self.settingsWindow.webContents.on('did-finish-load', function() {
            _self.settingsWindow.show();
        });
    }
}

Pussh.prototype.showEditorWindow = function() {
    var _self = this;

    if (_self.editorWindow) {
        _self.editorWindow.loadURL('file://' + path.join(app.getAppPath(), 'editor-window.html?lastURL=' + encodeURIComponent(_self.lastURL)));
        _self.editorWindow.focus();
    } else {
        _self.editorWindow = new BrowserWindow({
            "show": false,
            "width": 900,
            "height": 600,
            "minWidth": 900,
            "minHeight": 580,
            "auto-hide-menu-bar": true
        });

        _self.editorWindow.loadURL('file://' + path.join(app.getAppPath(), 'editor-window.html?lastURL=' + encodeURIComponent(_self.lastURL)));

        _self.editorWindow.on('closed', function() {
            _self.editorWindow = null;
        });

        _self.editorWindow.webContents.on('did-finish-load', function() {
            _self.editorWindow.show();
        });
    }
}

Pussh.prototype.setTrayState = function(state) {
    var _self = this;

    if (state === 'off') {
        var trayImg = NativeImage.createFromPath(path.join(app.getAppPath(), 'img', 'menu-icon.png'));
        if (_self.platform == 'win32') {
            trayImg = NativeImage.createFromPath(path.join(app.getAppPath(), 'img', 'menu-alt-icon.png'));
        }
        trayImg.setTemplateImage(true);

        _self.tray.setImage(trayImg);
    } else if (state === 'active') {
        _self.tray.setImage(path.join(app.getAppPath(), 'img', 'menu-active-icon@2x.png'));
    } else if (state === 'complete') {
        _self.tray.setImage(path.join(app.getAppPath(), 'img', 'menu-done-icon@2x.png'));
    }
}

Pussh.prototype.buildTrayMenu = function() {
    var _self = this;

    var menu = new Menu();

    // add the last url
    if (_self.lastURL) {
        menu.append(new MenuItem({
            label: _self.lastURL,
            click: function() {
                _self.copyToClipboard(_self.lastURL);
                _self.openInBrowser(_self.lastURL);
            }
        }));

        // add a separator
        menu.append(new MenuItem({
            type: 'separator'
        }));

        // // editor
        // menu.append(new MenuItem({
        //     label: 'Open Editor',
        //     click: function() {
        //         _self.showEditorWindow();
        //     }
        // }));

        // // add a separator
        // menu.append(new MenuItem({
        //     type: 'separator'
        // }));
    }

    // Take a cropped screenshot
    menu.append(new MenuItem({
        label: 'Cropped Capture',
        click: function() {
            if (_self.platform === 'darwin') exec('osascript -e \'tell application "System Events" to keystroke "$" using {command down, shift down}\'');
            if (_self.platform === 'win32') _self.windowsCapture(true);
        }
    }));

    // Take a fullscreen screenshot
    menu.append(new MenuItem({
        label: 'Screen Capture',
        click: function() {
            if (_self.platform === 'darwin') exec('osascript -e \'tell application "System Events" to keystroke "#" using {command down, shift down}\'');
            if (_self.platform === 'win32') _self.windowsCapture(false);
        }
    }));

    // add a separator
    menu.append(new MenuItem({
        type: 'separator'
    }));

    // open settings
    menu.append(new MenuItem({
        label: 'Settings',
        click: function() {
            _self.showSettingsWindow();
        }
    }));

    // quit app
    menu.append(new MenuItem({
        label: 'Quit '+this.name,
        click: function() {
            app.quit();
        }
    }));

    _self.tray.setContextMenu(menu);
}

Pussh.prototype.watch = function() {
    var _self = this;

    if (_self.platform == 'darwin') {
        var desktopFolder = path.join(process.env['HOME'], 'Desktop');

        var checkedFiles = [];
        setInterval(function() {
            fs.readdir(desktopFolder, function(err, files) {
                if (!err && files.length) {
                    var filteredFiles = files.filter(function(file) {
                        return (checkedFiles.indexOf(file) === -1 && /.png$/.test(file)) ? true : false;
                    });

                    filteredFiles.forEach(function(file) {
                        filePath = path.join(desktopFolder, file);

                        var fStats = fs.statSync(filePath);

                        if (Date.now()-fStats.ctime.getTime() > 3000) return;

                        exec('/usr/bin/mdls --raw --name kMDItemIsScreenCapture "'+filePath+'"', function(error, stdout) {
                            if (error) return;

                            // 1 = screenshot, 0 = not a screenshot
                            if (!parseInt(stdout)) {
                                checkedFiles.splice(checkedFiles.indexOf(file), 1);
                                return;
                            }

                            console.log('Uploading %s', filePath);

                            var newFile = _self.moveToTemp(filePath);

                            _self.upload(newFile, filePath);
                        });
                    });

                    checkedFiles = files;
                }
            });
        }, 1000);
    } else if (_self.platform == 'win32') {
        var windowsFullScreenshot = globalShortcut.register("Alt+Shift+3", function() {
            _self.windowsCapture(false);
        });

        var windowsCropScreenshot = globalShortcut.register("Alt+Shift+4", function() {
            _self.windowsCapture(true);
        });
    }
}

Pussh.prototype.windowsCapture = function(needsCrop) {
    var _self = this;

    if (_self.platform == 'win32') {

        // setup files
        var fullImg = path.join(app.getPath('temp'), 'pussh_screen.png');
        var cropImg = path.join(app.getPath('temp'), 'pussh_screen_crop.png');

        // take the screenshot and start crop if needed
        exec(path.join(app.getAppPath(), 'bin', 'win', 'PusshCap.exe') + ' ' + fullImg, function(error, stdout) {
            if (error) return;

            var theScreen = [0,0,100,100,0,0,'cap.png'];
            if (stdout) {
                theScreen = stdout.split(',');
            }

            if (!needsCrop) {
                _self.upload(fullImg);
            } else {
                _self.cropWindow = new BrowserWindow({
                    'width': parseInt(theScreen[2]),
                    'height': parseInt(theScreen[3]),
                    'x': parseInt(theScreen[0]),
                    'y': parseInt(theScreen[1]),
                    'show': false,
                    'skip-taskbar': true,
                    'frame': false
                });

                _self.cropWindow.on('closed', function() {
                    _self.cropWindow = null;
                    if (fs.existsSync(cropImg)) {
                        _self.deleteFile(fullImg);
                        _self.upload(cropImg);
                    }
                });

                _self.cropWindow.loadURL('file://' + path.join(app.getAppPath(), 'crop-window.html'));
            }
        });

    }
}

// Uploads a new file
Pussh.prototype.upload = function(file, oldFile) {
    var _self = this;

    var selectedService = _self.settings.get('selectedService');

    file = this.randomizeFilename(file);
    file = this.prefixFilename(file);

    // set status icon to active
    _self.setTrayState('active');

    // 20 second timeout if upload fails for some reason
    // should detect failure and show a dialog. really all error handling is bad right now
    setTimeout(function() {
        _self.setTrayState('off');
    }, 20000);

    this.resize(file, function() {
        _self.services.get(selectedService).upload(file, function(url) {
            _self.lastURL = url;

            // rebuild the tray menu with the new url
            _self.buildTrayMenu();

            // save link to clipboard
            _self.copyToClipboard(url);

            // remove files
            if (oldFile) _self.trash(oldFile);
            _self.deleteFile(file);

            // audio notification
            if (_self.settings.get('audioNotifications')) {
                _self.workerWindow.webContents.send('audio-notify', 'fire');
            }

            // open in browser
            if (_self.settings.get('openBrowser')) {
                _self.openInBrowser(url);
            }

            // set status icon to 'complete' for 3 seconds
            _self.setTrayState('complete');
            setTimeout(function() {
                _self.setTrayState('off');
            }, 3000);
        });
    });
}

Pussh.prototype.moveToTemp = function(file) {
    var _self = this;

    var tmpFile = path.join(app.getPath('temp'), path.basename(file));

    fs.writeFileSync(tmpFile, fs.readFileSync(file));

    return tmpFile;
}

// Trash file after upload
Pussh.prototype.trash = function(file) {
    var _self = this;

    if (_self.settings.get('sendToTrash') === false) return;

    var trashFolder;

    switch(_self.platform) {
        case 'win32':
            // this does not work
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

Pussh.prototype.deleteFile = function(file) {
    fs.unlinkSync(file);
}

Pussh.prototype.randomizeFilename = function(file) {
    if (this.settings.get('randomizeFilenames') === false) return file;

    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var newName = "";

    for(var i=0; i < this.settings.get('randomizeFilenamesLength'); i++) {
        newName += characters.charAt(Math.floor(Math.random()*characters.length));
    }

    newName += path.extname(file); // Append file extension

    var newFile = path.join(path.dirname(file), newName);
    fs.renameSync(file, newFile);
    return newFile;
}

Pussh.prototype.prefixFilename = function(file) {
    if (!this.settings.get('prefixFilenames').length) return file;

    var newName = this.settings.get('prefixFilenames')+path.basename(file);

    var newFile = path.join(path.dirname(file), newName);
    fs.renameSync(file, newFile);
    return newFile;
}

// Retina screens cause issues, so we give the option to resize
Pussh.prototype.resize = function(file, callback) {
    var _self = this;

    if (_self.platform !== 'darwin' || _self.settings.get('retinaResize') === false) return callback();

    exec('/usr/bin/sips -g dpiWidth -g pixelWidth "'+file+'"', function(error, stdout) {
        if (error) return callback();

        var lines = stdout.split('\n');

        var dpiWidth = parseFloat(lines[1].split(':')[1].trim());
        var pixelWidth = parseInt(lines[2].split(':')[1].trim());

        if (parseInt(dpiWidth) === 72) return callback();

        var newWidth = Math.round((72 / dpiWidth) * pixelWidth);

        exec('/usr/bin/sips --resampleWidth '+newWidth+' "'+file+'"', function(error, stdout) {
            callback();
        });
    });
}

// Send notification if enabled
Pussh.prototype.notify = function(body, url) {
    var _self = this;

    if (_self.settings.get('enableNotifications')) {

        if (_self.platform == 'win32') {
            var icon = NativeImage.createFromPath(path.join(app.getAppPath(), 'img', 'icon.png'));

            _self.tray.displayBalloon({
                title: 'Pussh',
                content: body,
                icon: icon
            });
        } else {
            _self.workerWindow.webContents.send('unix-notify', {body: body, url: url});
        }
    }
}

// Open a URL in the default browser
Pussh.prototype.openInBrowser = function(url) {
    shell.openExternal(url);
}

// Copy url to clipboard after upload
Pussh.prototype.copyToClipboard = function(url) {
    var _self = this;

    clipboard.writeText(url);
    _self.notify('The screenshot URL has been copied to your clipboard.', url);
}

app.on('ready', function() {
    global.Pussh = new Pussh();
});
