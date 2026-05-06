const fs = require('fs');
const path = require('path');

const ServiceSettings = require('../service-settings');

class Service extends ServiceSettings {
    constructor(pusshSettings) {
        super(pusshSettings, 'scrup');

        this.name = 'Scrup';
        this.description = 'Scrup compatible uploader';

        this.settings = [
            {
                name: 'Upload URL',
                key: 'upload_url',
                type: 'text',
                password: false,
                default: '',
                helpText: 'The URL to recieve the POST request'
            }
        ];

        this.loadSettings();
    }

    async upload(filePath, callback) {
        if (!this.getSetting('upload_url')) return callback(new Error('No url configured for upload'));

        try {
            const res = await fetch(this.getSetting('upload_url'), {
                method: 'POST',
                body: fs.readFileSync(filePath)
            });
            if (res.status !== 200) {
                return callback(new Error(`HTTP error occurred: ${res.status} server response code`));
            }
            const body = await res.text();
            if (!body) return callback(new Error('HTTP error occurred: empty response'));
            callback(null, body);
        } catch (err) {
            callback(new Error(`HTTP error occurred: ${err.message}`));
        }
    }
}

module.exports = Service;
