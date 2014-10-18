var path = require('path');
var ssh = require('ssh2');

function Service(main) {
    this._name = "sftp";
    this.name = "SFTP";
    this.description = "Upload screenshots to a server via SFTP";

    this.settings = [
        {
            name: 'Hostname',
            key: 'hostname',
            type: 'text',
            default: '',
            helpText: 'The hostname or IP of the server',
            required: true
        },
        {
            name: 'Port',
            key: 'port',
            type: 'text',
            default: 22,
            helpText: 'The port on the server to connect to',
            required: true
        },
        {
            name: 'Path',
            key: 'path',
            type: 'text',
            default: '',
            helpText: 'The path to the directory to store screenshots',
            required: true
        },
        {
            name: 'Username',
            key: 'username',
            type: 'text',
            default: '',
            helpText: 'The username you wish to authenticate as',
            required: true
        },
        {
            name: 'Password',
            key: 'password',
            type: 'password',
            default: '',
            helpText: 'The password to login with',
            required: false
        },
        {
            name: 'Private Key',
            key: 'private_key',
            type: 'file',
            default: '',
            helpText: '(optional) The SSH Keyfile to login with',
            required: false
        },
        {
            name: 'URL',
            key: 'url',
            type: 'text',
            default: '',
            helpText: 'The URL to the directory holding screenshots',
            required: true
        }
    ];

    this._settings = main.settings;
}

Service.prototype.upload = function(file, callback) {
    var _self = this;

    var conn = new Connection();
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

                var url = _self.getSetting('url')+fileName;

                callback(url);
            });
        });
    }).connect({
        host: this.getSetting('hostname'),
        port: this.getSetting('port'),
        username: this.getSetting('username'),
        password: this.getPassword() || undefined,
        privateKey: this.getSetting('private_key') || undefined
    });
}

Service.prototype.save = function(data) {
    var options = Object.keys(data);

    var _self = this;
    options.forEach(function(option) {
        if(option === 'password') {
            _self.setPassword(options[option]);
        } else {
            _self.setSetting(option, options[option]);
        }
    });
}

Service.prototype.getSetting = function(key) {
    return this._settings.get(this._name+'_'+key);
}

Service.prototype.setSetting = function(key, value) {
    return this._settings.set(this._name+'_'+key, value);
}

Service.prototype.getPassword = function() {
    return this._settings.getPassword(this._name);
}

Service.prototype.setPassword = function(password) {
    return this._settings.setPassword(this._name, password);
}

module.exports = Service;