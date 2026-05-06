const fs = require('fs');
const path = require('path');

const ServiceSettings = require('../service-settings');

const ImgurClientID = 'b4723b6a37fa1bb';

class Service extends ServiceSettings {
    constructor(pusshSettings) {
        super(pusshSettings, 'imgur');

        this.name = 'Imgur';
        this.description = 'Share screenshots easily to Imgur.com';

        this.settings = [];
    }

    upload(filePath, callback) {
        fs.readFile(filePath, async (err, data) => {
            if (err) return callback(err);

            try {
                const body = new URLSearchParams({
                    type: 'base64',
                    image: data.toString('base64')
                });
                const res = await fetch('https://api.imgur.com/3/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Client-ID ${ImgurClientID}`
                    },
                    body
                });
                if (res.status !== 200) {
                    return callback(new Error(`HTTP error occurred: ${res.status} server response code`));
                }
                const json = await res.json();
                if (!json || !json.data || !json.data.link) {
                    return callback(new Error('HTTP error occurred: empty response'));
                }
                callback(null, json.data.link.replace(/^http:/, 'https:'));
            } catch (err) {
                callback(new Error(`HTTP error occurred: ${err.message}`));
            }
        });
    }
}

module.exports = Service;
