var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

var ServiceSettings = require('../service-settings');

function Service(main) {
    this._settings = main.settings;
    Service.super_.call(this);

    this._name = "move_local";
    this.name = "Move Local";
    this.description = "Move screenshots to a folder other then the desktop";

    this.settings = [
        {
            name: 'Location',
            key: 'location',
            type: 'text',
            password: false,
            default: '',
            helpText: 'Move new screenshots to this folder'
        }
    ];

    this.loadSettings();
}

util.inherits(Service, ServiceSettings);

Service.prototype.upload = function(file, callback) {
    var _self = this;
    if (!_self.getSetting('location')) return window.alert('No location configured');

    var newFile = path.join(_self.getSetting('location'), path.basename(file));

    fs.writeFileSync(newFile, fs.readFileSync(file));

    callback(url.resolve('file://', newFile));
}

module.exports = Service;
