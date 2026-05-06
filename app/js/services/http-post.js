const fs = require('fs');
const path = require('path');

const ServiceSettings = require('../service-settings');

class Service extends ServiceSettings {
    constructor(pusshSettings) {
        super(pusshSettings, 'post');

        this.name = 'HTTP POST';
        this.description = 'Upload screenshots to a server via HTTP POST';

        this.settings = [
            {
                name: 'Upload URL',
                key: 'upload_url',
                type: 'text',
                password: false,
                default: '',
                helpText: 'The URL to recieve the POST request'
            },
            {
                name: 'Form Field',
                key: 'form_field',
                type: 'text',
                password: false,
                default: 'screenshot',
                helpText: 'The name of the form field for the POST request'
            },
            {
                name: 'URL',
                key: 'url',
                type: 'text',
                password: false,
                default: '',
                helpText: 'The remote URL for your screenshots'
            },
            {
                name: 'Append File Extension',
                key: 'append_extension',
                type: 'checkbox',
                helpText: 'Append the image extension on the URL. E.g. example.org/image -> example.org/image.png'
            }
        ];

        this.loadSettings();
    }

    async upload(filePath, callback) {
        if (!this.getSetting('upload_url')) return callback(new Error('No upload url configured for upload'));
        if (!this.getSetting('form_field')) return callback(new Error('You must set a POST form field'));
        if (!this.getSetting('url')) return callback(new Error('No url configured'));

        try {
            const fileBuffer = fs.readFileSync(filePath);
            const formData = new FormData();
            formData.append(this.getSetting('form_field'), new Blob([fileBuffer]), path.basename(filePath));

            const response = await fetch(this.getSetting('upload_url'), {
                method: 'POST',
                body: formData
            });
            if (response.status >= 300) {
                return callback(new Error(`HTTP error occurred: ${response.status} server response code`));
            }

            const fileName = this.getSetting('append_extension') ? path.basename(filePath) : path.basename(filePath).split('.')[0];
            callback(null, this.getSetting('url') + encodeURIComponent(fileName));
        } catch (err) {
            callback(new Error(`HTTP error occurred: ${err.message}`));
        }
    }
}

module.exports = Service;
