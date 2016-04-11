var remote = require('remote');
var app = remote.require('app');
var os = require('os');
var path = require('path');
var Jimp = require('jimp');

$(function() {
    var cropWindow = remote.getCurrentWindow();
    cropWindow.on('blur', function() {
        cropWindow.destroy();
    });

    // setup files
    var fullImg = path.join(app.getPath('temp'), 'pussh_screen.png');
    var cropImg = path.join(app.getPath('temp'), 'pussh_screen_crop.png');

    // load the img preview
    $('#img').attr('src', fullImg + '?c=' + new Date().getTime());
    $('#img').load(function() {
        //cropWindow.setFullScreen(true); // fullscreen is buggy :/
        cropWindow.show();
        cropWindow.focus();

        // flash white
        setTimeout(function() {
            $('#white').fadeOut(200);
        }, 100);
    });

    // close on esc key
    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            cropWindow.destroy();
        }
    });

    var dragging = false;
    var mouseLoc = {x: 0, y: 0};
    var dragStart = {x: 0, y: 0};
    var dragSize = {x: 0, y: 0};
    var dragEnd = {x: 0, y: 0};
    var scale = {x: 1, y: 1};

    // update mouse location
    $(window).on('mousemove', function(e) {
        mouseLoc.x = e.clientX;
        mouseLoc.y = e.clientY;

        if (mouseLoc.x > $(document).width()) mouseLoc.x = $(document).width();
        if (mouseLoc.y > $(document).height()) mouseLoc.y = $(document).height();

        if (mouseLoc.x < 0) mouseLoc.x = 0;
        if (mouseLoc.y < 0) mouseLoc.y = 0;

        scale.x = $('#img')[0].naturalWidth / $('#img').width();
        scale.y = $('#img')[0].naturalHeight / $('#img').height();

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

            $('#cords').html(Math.round(dragSize.x * scale.x) + '<br />' + Math.round(dragSize.y * scale.y));
        } else {
            $('#cords').html(Math.round(mouseLoc.x * scale.x) + '<br />' + Math.round(mouseLoc.y * scale.y));
        }
    });

    // start cropping
    $(window).on('mousedown', function(e) {
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
    $(window).on('mouseup', function(e) {
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
        if (dragSize.x <= 1 && dragSize.y <= 1) {
            cropWindow.destroy();
        } else {
            var left = dragEnd.x > dragStart.x ? dragStart.x : dragEnd.x;
            var top = dragEnd.y > dragStart.y ? dragStart.y : dragEnd.y;
            left = left * scale.x;
            top = top * scale.y;

            var width = dragSize.x * scale.x;
            var height = dragSize.y * scale.y;

            // crop and save img. main script looks for the cropped file on window closed
            Jimp.read(fullImg, function(error, image) {
                if (error) return;

                image.crop(left, top, width, height);

                image.write(cropImg, function() {
                    cropWindow.destroy();
                });
            });
        }
    });

});
