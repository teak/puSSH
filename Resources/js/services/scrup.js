var request = require('request');
var fs = require('fs');
var path = require('path');
var util = require('util');

var ServiceSettings = require('../service-settings');

function Service(main) {
    this._settings = main.settings;
    Service.super_.call(this);

    this._name = "scrup";
    this.name = "Scrup";
    this.description = "Scrup compatible uploader";

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

util.inherits(Service, ServiceSettings);

Service.prototype.upload = function(filepath, callback) {
    var _self = this;

    if (!_self.getSetting('upload_url')) return window.alert('No url configured for upload');

    request.post({
        url: _self.getSetting('upload_url'),
        body: fs.readFileSync(filepath)
    }, function(err, response, body) {
        if (err) {
            window.alert('error: ' + err);
            return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
            window.alert('error: server returned status code ' + response.statusCode);
            return;
        }

        callback(body);
    });
}

module.exports = Service;
