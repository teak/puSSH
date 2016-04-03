var path = require('path');
var slash = require('slash');
var ssh = require('ssh2');
var util = require('util');
var dialog = require('electron').dialog;

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
            key: 'sftp_password',
            type: 'password',
            password: true,
            default: '',
            helpText: 'The password to login with'
        },
        {
            name: 'Private Key',
            key: 'sftp_private_key',
            type: 'textarea',
            password: true,
            default: '',
            helpText: '(optional) The SSH Private Key to login with'
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

    if(!_self.getSetting('hostname')) return dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'No hostname configured for upload'});
    if(!_self.getSetting('port')) return dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'No port configured for upload'});
    if(!_self.getSetting('username')) return dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'No username configured for upload'});
    if(!_self.getSetting('url')) return dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'No url configured for upload'});

    var conn = new ssh();
    conn.on('ready', function() {
        conn.sftp(function(err, sftp) {
            if(err) {
                conn.end();
                dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'Error connecting to server'});
                return;
            }

            var fileName = path.basename(file);

            sftp.fastPut(file, slash(path.join(_self.getSetting('path'), fileName)), function(err) {
                if(err) {
                    conn.end();
                    dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: 'Error uploading to server'});
                    return;
                }

                var url = _self.getSetting('url')+encodeURIComponent(fileName);

                callback(url);
                conn.end();
            });
        });
    }).on('error', function(e) {
        dialog.showMessageBox({type: 'error', buttons: ['Okay'], message: 'An error has occured :(', detail: e});
        conn.end();
    }).connect({
        host: _self.getSetting('hostname'),
        port: _self.getSetting('port'),
        username: _self.getSetting('username'),
        password: !_self.getPassword('sftp_private_key') ? _self.getPassword('sftp_password') : undefined,
        passphrase: _self.getPassword('sftp_private_key') ? _self.getPassword('sftp_password') : undefined,
        privateKey: _self.getPassword('sftp_private_key') || undefined
    });
}

module.exports = Service;