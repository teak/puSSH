var path = require('path');
var ssh = require('ssh2');
var util = require('util');

var ServiceSettings = require('../service-settings');

function Service(main) {
    this._settings = main.settings;
    Service.super_.call(this);

    this._name = "sftp";
    this.name = "SFTP";
    this.description = "Upload screenshots to a server via SFTP";

    this.settings = [
        {
            name: 'Hostname',
            key: 'hostname',
            type: 'text',
            password: false,
            default: '',
            helpText: 'The hostname or IP of the server'
        },
        {
            name: 'Port',
            key: 'port',
            type: 'text',
            password: false,
            default: 22,
            helpText: 'The port on the server to connect to'
        },
        {
            name: 'Path',
            key: 'path',
            type: 'text',
            password: false,
            default: '',
            helpText: 'The path to the directory to store screenshots'
        },
        {
            name: 'Username',
            key: 'username',
            type: 'text',
            password: false,
            default: '',
            helpText: 'The username you wish to authenticate as'
        },
        {
            name: 'Password',
            key: 'password',
            type: 'password',
            password: true,
            default: '',
            helpText: 'The password to login with'
        },
        {
            name: 'Private Key',
            key: 'private_key',
            type: 'textarea',
            password: true,
            default: '',
            helpText: '(optional) The SSH Keyfile to login with'
        },
        {
            name: 'URL',
            key: 'url',
            type: 'text',
            password: false,
            default: '',
            helpText: 'The URL to the directory holding screenshots'
        }
    ];

    this.loadSettings();
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