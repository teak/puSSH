const { ipcRenderer, shell } = require('electron');
const remote = require('@electron/remote');
const { app, screen, clipboard } = remote;

const { createWorker } = require('tesseract.js/dist/tesseract.min.js');
const path = require('path');

$(() => {
    const imageURL = decodeURIComponent(window.location.href.split('?img_url=')[1]);

    $('#img').attr('src', imageURL);

    // TODO: more languages

    (async () => {
        const worker = await createWorker({
            cachePath: path.join(__dirname, 'ocr-data'),
            logger: (ocr) => {
                let progress = 10;
    
                if (ocr.status == 'loaded tesseract core') progress = 20;
                if (ocr.status == 'loaded language traineddata') progress = 30;
                if (ocr.status == 'initialized api') progress = 60;
                if (ocr.status == 'recognizing text') progress = 70 + (ocr.progress * 30);
    
                $('#progress').css('right', (100 - progress) + '%');
            }
        });
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(imageURL);

        $('#ocr-text').val(text);

        setTimeout(() => {
            $('#progress').fadeOut();
        }, 1000);

        await worker.terminate();
    })();

});
