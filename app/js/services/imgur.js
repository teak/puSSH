var fs = require('fs');
var path = require('path');
var request = require('request');
var ssh = require('ssh2');
var util = require('util');
var dialog = require('electron').dialog;

var ServiceSettings = require('../service-settings');

function Service(main) {
    this._settings = main.settings;
    Service.super_.call(this);

    this._name = "imgur";
    this.name = "Imgur";
    this.description = "Share screenshots easily to Imgur.com";

    this.settings = [];
}

util.inherits(Service, ServiceSettings);

Service.prototype.upload = function(file, callback) {
    fs.readFile(file, function(err, data) {
        var image = new Buffer(data).toString('base64');
        
        request.post({
            url: 'https://api.imgur.com/3/upload',
            headers: {
                'Authorization': 'Client-ID b4723b6a37fa1bb'
            },
            form: {
                type: 'base64',
                image: image
            }
        }, function(err, res, body) {
            try {
                body = JSON.parse(body);
            } catch(e) {
                res.statusCode = 500;
            }

            if(!err && res.statusCode === 200) {
                var link = body.data.link.replace(/^http/,'https');
                callback(link);
            } else {
                if(res.statusCode !== 500 && body.data && typeof body.data.error === 'object') {
                    dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'Imgur Error: '+body.data.error.message});
                } else {
                    dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'Error uploading to Imgur.'});
                }
            }
        });
    });
}

module.exports = Service;
