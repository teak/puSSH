// was in worker window
ipc.on('chrome-cap', function(message) {
    navigator.webkitGetUserMedia({
        video: {
            mandatory: {
                chromeMediaSource: 'screen',
                maxWidth: 1920,
                maxHeight: 2250
            },
            optional: []
        },
        audio: false
    }, function(stream) {
        
        var video = document.createElement('video');

        video.addEventListener('loadedmetadata', function() {
            // setup path
            var savePath = path.join(app.getPath('temp'), 'pussh_screen.png');
            console.log(savePath);

            // use canvas to conver data to somthing usable
            var canvas = document.createElement('canvas');
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            //create data url
            var imageDataURL = canvas.toDataURL();

            // end meadia stream
            stream.getTracks()[0].stop();

            // remove 'data' from base64 url
            var matches = imageDataURL.match(/^data:.+\/(.+);base64,(.*)$/);
            var ext = matches[1];
            var data = matches[2];

            // save file
            var buffer = new Buffer(data, 'base64');
            fs.writeFileSync(savePath, buffer);

            ipc.sendSync('screen-saved', savePath);
        }, false);

        video.src = URL.createObjectURL(stream);
        video.play();

    }, function(err) {
        console.log("An error occured! " + err);
    });
});