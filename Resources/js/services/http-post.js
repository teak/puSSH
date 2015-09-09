var request = require('request');
var fs = require('fs');
var path = require('path');
var util = require('util');

var ServiceSettings = require('../service-settings');

function Service(main) {
    this._settings = main.settings;
    Service.super_.call(this);

    this._name = "post";
    this.name = "HTTP POST";
    this.description = "Upload screenshots to a server via HTTP POST";

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
            key: 'appendExtension',
            type: 'checkbox',
            helpText: 'Remove the image extension from the URL. E.g. example.org/image.png -> example.org/image'
        }
    ];

    this.loadSettings();
}

util.inherits(Service, ServiceSettings);

Service.prototype.upload = function(filepath, callback) {
    var _self = this;

    if (!_self.getSetting('upload_url')) return window.alert('No upload url configured for upload');
    if (!_self.getSetting('form_field')) return window.alert('You must set a POST form field');
    if (!_self.getSetting('url')) return window.alert('No url configured');

    var formData = {};
    formData[_self.getSetting('form_field')] = fs.createReadStream(filepath);

    request.post({
        url: _self.getSetting('upload_url'),
        formData: formData
    }, function(err, response, body) {
        if (err) {
            window.alert('error: ' + err);
            return;
        }

        if (response.statusCode != 200) {
            window.alert('error: server returned status code ' + response.statusCode);
            return;
        }

        var fileName = _self.getSetting("appendExtension") ? path.basename(filepath) : path.basename(filepath).split(".")[0];
        callback(_self.getSetting('url') + encodeURIComponent(fileName));
    });
}

module.exports = Service;
