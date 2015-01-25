var gui = require('nw.gui');
var exec = require('child_process').exec;
var os = require('os');
var path = require('path');
var fs = require('fs');
var PNGCrop = require('png-crop');

$(function() {
    var cropWindow = gui.Window.get();

    cropWindow.setShowInTaskbar(false);
    cropWindow.enterFullscreen();
    cropWindow.focus();

    // setup files
    var basePath;
    switch(os.platform()) {
        case 'win32':
            basePath = process.env['TEMP'];
            break;
        case 'darwin':
            basePath = process.env['TMPDIR'];
            break;
        case 'linux':
            basePath = '/tmp';
            break;
        default:
            return;
    }
    var fullImg = path.join(basePath, 'pussh_screen.png');
    var cropImg = path.join(basePath, 'pussh_screen_crop.png');

    // load the img preview
    $('#img').attr('src', fullImg);

    // close button
    $('.close').on('click', function(e) {
        cropWindow.leaveFullscreen();
        cropWindow.close();
    });

    // move info text
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

    var dragging = false;
    var mouseLoc = {x: 0, y: 0};
    var dragStart = {x: 0, y: 0};
    var dragSize = {x: 0, y: 0};
    var dragEnd = {x: 0, y: 0};

    // update mouse location
    $('body').on('mousemove', function(e) {
        mouseLoc.x = e.clientX;
        mouseLoc.y = e.clientY;

        $('#cords').css({
            "top": mouseLoc.y,
            "left": mouseLoc.x
        });

        if (dragging) {
            dragSize.x = Math.abs(mouseLoc.x - dragStart.x) + 1;
            dragSize.y = Math.abs(mouseLoc.y - dragStart.y) + 1;

            if (mouseLoc.y < dragStart.y) {
                $('#selection').css('top', mouseLoc.y);
            }
            if (mouseLoc.x < dragStart.x) {
                $('#selection').css('left', mouseLoc.x);
            }

            $('#selection').css({
                "height": dragSize.y,
                "width": dragSize.x
            });

            $('#cords').html(dragSize.x + '<br />' + dragSize.y);
        } else {
            $('#cords').html(mouseLoc.x + '<br />' + mouseLoc.y);
        }
    });

    // start cropping
    $('body').on('mousedown', function(e) {
        dragging = true;

        dragStart.x = mouseLoc.x;
        dragStart.y = mouseLoc.y;
        dragSize.x = 0;
        dragSize.y = 0;
        dragEnd.x = 0;
        dragEnd.y = 0;

        $('#selection').css({
            "top": mouseLoc.y,
            "left": mouseLoc.x,
            "height": 0,
            "width": 0
        });
        $('#selection').show();
    });

    // stop cropping
    $('body').on('mouseup', function(e) {
        if (!dragging) return;
        dragging = false;

        dragEnd.x = mouseLoc.x + 1;
        dragEnd.y = mouseLoc.y + 1;
        dragSize.x = Math.abs(mouseLoc.x - dragStart.x) + 1;
        dragSize.y = Math.abs(mouseLoc.y - dragStart.y) + 1;

        $('#selection').hide();
        $('#selection').css({
            "height": 0,
            "width": 0
        });

        // dont upload if the crop is 0
        if (dragSize.x == 0 && dragSize.y == 0) {
            cropWindow.leaveFullscreen();
            cropWindow.close();
        } else {
            var left = dragEnd.x > dragStart.x ? dragStart.x : dragEnd.x;
            var top = dragEnd.y > dragStart.y ? dragStart.y : dragEnd.y;

            // crop and save img. main script looks for the cropped file on cropWindow closed
            PNGCrop.crop(fullImg, cropImg, {width: dragSize.x, height: dragSize.y, top: top, left: left}, function(err) {
                cropWindow.leaveFullscreen();
                cropWindow.close();
            });
        }
    });

});
