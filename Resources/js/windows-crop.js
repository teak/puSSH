var gui = require('nw.gui');
var exec = require('child_process').exec;
var os = require('os');
var path = require('path');

$(function() {
    var cropWindow = gui.Window.get();

    //cropWindow.setAlwaysOnTop(true);
    cropWindow.setShowInTaskbar(false);

    $('.close').on('click', function(e) {
        cropWindow.close(true);
    });

    var filePath = path.join(process.env['TEMP'], 'pussh_screen.png');

    $('#img').attr('src', filePath);

    var hoverLocation = 0;
    $('#info').on('mouseleave', function(e) {
        if (hoverLocation == 0) {
            $('#info').animate({
                left: cropWindow.width - $('#info').outerWidth() - 50
            }, 500, function() {
                hoverLocation = 1;
            });
            
        } else if (hoverLocation == 1) {
            $('#info').animate({
                top: cropWindow.height - $('#info').outerHeight() - 50
            }, 500, function() {
                hoverLocation = 2;
            });
        } else if (hoverLocation == 2) {
            $('#info').animate({
                left: 50
            }, 500, function() {
                hoverLocation = 3;
            });
        } else if (hoverLocation == 3) {
            $('#info').animate({
                top: 50
            }, 500, function() {
                hoverLocation = 0;
            });
        }
    });

});
