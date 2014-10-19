var path = require('path');
var ssh = require('ssh2');

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

Service.prototype.upload = function(file, callback) {
    console.log('Upload triggered on test service');
}

Service.prototype.save = function(data) {
    console.log('Save triggered on test service');
}

// TODO: We should probably just extend these into each service, rather than defining them in each
Service.prototype.getSetting = function(key) {
    return this._settings.get(this._name+'_'+key);
}

Service.prototype.setSetting = function(key, value) {
    return this._settings.set(this._name+'_'+key, value);
}

Service.prototype.getPassword = function(key) {
    return this._settings.getPassword(this._name+'_'+key);
}

Service.prototype.setPassword = function(key, password) {
    return this._settings.setPassword(this._name+'_'+key, password);
}

module.exports = Service;
