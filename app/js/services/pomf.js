const fs = require('fs');
const path = require('path');

const ServiceSettings = require('../service-settings');

class Service extends ServiceSettings {
    constructor(pusshSettings) {
        super(pusshSettings, 'pomf');

        this.name = 'Pomf';
        this.description = 'Upload screenshots to a Pomf-compatible API via HTTP';

        this.settings = [
            {
                name: 'Upload URL',
                key: 'upload_url',
                type: 'text',
                password: false,
                default: 'https://a.pomf.cat/upload.php',
                helpText: 'The upload endpoint of the Pomf server, usually upload.php'
            },
            {
                name: 'Result URL',
                key: 'result_url',
                type: 'text',
                password: false,
                default: 'https://a.pomf.cat/',
                helpText: 'The result URL for your screenshots'
            }
        ];

        this.loadSettings();
    }

    async upload(filePath, callback) {
        if (!this.getSetting('upload_url')) return callback(new Error('No upload URL configured for upload'));

        let response;
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const formData = new FormData();
            formData.append('files[]', new Blob([fileBuffer], { type: 'image/png' }), path.basename(filePath));

            response = await fetch(this.getSetting('upload_url'), {
                method: 'POST',
                body: formData
            });
        } catch (err) {
            return callback(new Error(`HTTP error occurred: ${err.message}`));
        }
        if (response.status >= 300) {
            return callback(new Error(`HTTP error occurred: ${response.status} server response code`));
        }

        let body;
        try {
            body = await response.json();
        } catch (err) {
            return callback(new Error('The Pomf API returned an invalid JSON response'));
        }
        if (!body.success || !body.files || body.files.length === 0) {
            return callback(new Error('The Pomf API returned an unexpected response'));
        }

        let result_url = this.getSetting('result_url');
        if (result_url.length > 0 && result_url[result_url.length - 1] !== '/') {
            result_url += '/';
        }
        callback(null, result_url + body.files[0].url);
    }
}

module.exports = Service;
