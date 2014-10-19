var path = require('path');
var ssh = require('ssh2');
var util = require('util');

var ServiceSettings = require('../service-settings');

function Service(main) {
    Service.super_.call(this);

    this._name = "sftp";
    this.name = "SFTP";
    this.description = "Upload screenshots to a server via SFTP";

    this.form = [
        'hostname',
        'port',
        'path',
        'username',
        {
            key: 'password',
            type: 'password'
        },
        'private_key',
        'url'
    ];

    this.schema = {
        "type": "object",
        "title": "SFTP",
        "properties": {
            "hostname": {
                "title": 'Hostname',
                "type": 'string',
                "description": 'The hostname or IP of the server'
            },
            "port": {
                "title": 'Port',
                "type": 'string',
                "description": 'The port on the server to connect to'
            },
            "path": {
                "title": 'Path',
                "type": 'string',
                "description": 'The path to the directory to store screenshots'
            },
            "username": {
                "title": 'Username',
                "type": 'string',
                "description": 'The username you wish to authenticate as'
            },
            "password": {
                "title": 'Password',
                "type": 'string',
                "description": 'The password to login with'
            },
            "private_key": {
                "title": 'Private Key',
                "type": 'string',
                "description": '(optional) The SSH Keyfile to login with'
            },
            "url": {
                "title": 'URL',
                "type": 'string',
                "description": 'The URL to the directory holding screenshots'
            }
        },
        "required": [
            'hostname',
            'port',
            'path',
            'username',
            'url'
        ]
    };

    this._settings = main.settings;
}

util.inherits(Service, ServiceSettings);

Service.prototype.upload = function(file, callback) {
    var _self = this;

    if(!this.getSetting('hostname')) return window.alert('No hostname configured for upload');
    if(!this.getSetting('port')) return window.alert('No port configured for upload');
    if(!this.getSetting('username')) return window.alert('No username configured for upload');
    if(!this.getSetting('url')) return window.alert('No url configured for upload');

    var conn = new ssh();
    conn.on('ready', function() {
        conn.sftp(function(err, sftp) {
            if(err) {
                conn.end();
                window.alert('Error connecting to server');
                return;
            }

            var fileName = path.basename(file);

            sftp.fastPut(file, path.join(_self.getSetting('path'), fileName), function(err) {
                if(err) {
                    conn.end();
                    window.alert('Error uploading to server');
                    return;
                }

                var url = _self.getSetting('url')+encodeURIComponent(fileName);

                callback(url);
            });
        });
    }).on('error', function(e) {
        window.alert(e);
        conn.end();
    }).connect({
        host: this.getSetting('hostname'),
        port: this.getSetting('port'),
        username: this.getSetting('username'),
        password: !this.getPassword('private_key') ? this.getPassword('password') : undefined,
        passphrase: this.getPassword('private_key') ? this.getPassword('password') : undefined,
        privateKey: this.getPassword('private_key') || undefined
    });
}

module.exports = Service;