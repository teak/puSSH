var remote = require('electron').remote;
var app = remote.app;
var dialog = remote.dialog;
var clipboard = remote.clipboard;
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
var path = require('path');
var Jimp = require('jimp');

$(function() {
    var imageURL = decodeURIComponent(window.location.href.split('?lastURL=')[1]);
    var platform = os.platform();
    var isVector = false;

    $('.img').attr('src', imageURL);

    $('.save').on('click', function() {
        if (isVector) {
            var savePath = dialog.showSaveDialog({
                filters: [
                    {name: 'Images', extensions: ['svg']}
                ]
            });

            if (savePath) {
                fs.writeFileSync(savePath, fs.readFileSync(path.join(app.getPath('temp'), 'potrace.svg')));
            }
        } else {
            // save canvas as png
        }
    });

    $('.vector').on('click', function() {

        Jimp.read(imageURL, function(error, image) {
            if (error) return;

            var imgPath = path.join(app.getPath('temp'), 'potrace.bmp');
            var binPath;
            if (platform == 'darwin') {
                binPath = path.join(app.getAppPath(), 'bin', 'osx', 'potrace');
            } else if (platform == 'win32') {
                binPath = path.join(app.getAppPath(), 'bin', 'win', 'potrace.exe');
            } else {
                return;
            }

            image.write(imgPath, function() {
                exec(binPath + ' -s -n ' + imgPath, function(error, stdout) {
                    if (error) return;

                    isVector = true;
                    $('.img').attr('src', path.join(app.getPath('temp'), 'potrace.svg'));

                    //console.log(clipboard.availableFormats());
                    //clipboard.writeHtml(fs.readFileSync(path.join(app.getPath('temp'), 'potrace.svg')), 'text/svg');
                });
            });
        });

    });
});
