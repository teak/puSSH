var path = require('path');
var ssh = require('ssh2');
var util = require('util');

var ServiceSettings = require('../service-settings');

function Service(main) {
    this._name = "test_service";
    this.name = "This is a Test Service";
    this.description = "This is only a test.";

    this.form = [
        'username',
        {
            key: 'password',
            type: 'password'
        }
    ];

    this.schema = {
        "type": "object",
        "title": "Test Service",
        "properties": {
            "username": {
                "title": 'Username',
                "type": 'string',
                "description": 'The username you wish to authenticate as'
            },
            "password": {
                "title": 'Password',
                "type": 'string',
                "description": 'The password to login with'
            }
        },
        "required": [
            'username'
        ]
    };

    this._settings = main.settings;
}

util.inherits(Service, ServiceSettings);

Service.prototype.upload = function(file, callback) {
    console.log('Upload triggered on test service');
}

module.exports = Service;