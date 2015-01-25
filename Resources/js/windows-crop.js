var gui = require('nw.gui');
var exec = require('child_process').exec;
var os = require('os');
var path = require('path');

$(function() {
    var cropWindow = gui.Window.get();

    //cropWindow.setAlwaysOnTop(true);
    //cropWindow.setShowInTaskbar(false);
    cropWindow.enterFullscreen();
    cropWindow.focus();

    $('.close').on('click', function(e) {
        cropWindow.leaveFullscreen();
        cropWindow.close();
    });

    var hoverLocation = 0;
    var speed = 100;
    $('#info').on('mouseleave', function(e) {
        if (hoverLocation == 0) {
            $('#info').animate({
                left: $(window).width() - $('#info').outerWidth() - 50
            }, speed, function() {
                hoverLocation = 1;
            });
        } else if (hoverLocation == 1) {
            $('#info').animate({
                top: $(window).height() - $('#info').outerHeight() - 50
            }, speed, function() {
                hoverLocation = 2;
            });
        } else if (hoverLocation == 2) {
            $('#info').animate({
                left: 50
            }, speed, function() {
                hoverLocation = 3;
            });
        } else if (hoverLocation == 3) {
            $('#info').animate({
                top: 50
            }, speed, function() {
                hoverLocation = 0;
            });
        }
    });

    var filePath = '';
    var baseName = 'pussh_screen.png';

    switch(os.platform()) {
        case 'win32':
            filePath = path.join(process.env['TEMP'], baseName);
            break;
        case 'darwin':
            filePath = path.join(process.env['TMPDIR'], baseName);
            break;
        case 'linux':
            filePath = path.join('/tmp', baseName);
            break;
        default:
            return;
    }

    $('#img').attr('src', filePath);

});
