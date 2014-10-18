var path = require('path');
var ssh = require('ssh2');

function Service(main) {
    this._name = "sftp";
    this.name = "SFTP";
    this.description = "Upload screenshots to a server via SFTP";

    this.settings = [
        'hostname',
        'port',
        'path',
        'username',
        {
            key: 'password',
            type: 'password'
        },
        {
            key: 'private_key',
            type: 'password'
        },
        'url'
    ];

    this.schema = {
        type: "object",
        title: "SFTP",
        properties: {
            hostname: {
                title: 'Hostname',
                type: 'text',
                description: 'The hostname or IP of the server',
            },
            port: {
                title: 'Port',
                type: 'text',
                description: 'The port on the server to connect to',
            },
            path: {
                title: 'Path',
                type: 'text',
                description: 'The path to the directory to store screenshots',
            },
            username: {
                title: 'Username',
                type: 'text',
                description: 'The username you wish to authenticate as',
            },
            password: {
                title: 'Password',
                type: 'password',
                description: 'The password to login with',
            },
            private_key: {
                title: 'Private Key',
                type: 'file',
                description: '(optional) The SSH Keyfile to login with',
            },
            url: {
                title: 'URL',
                type: 'text',
                description: 'The URL to the directory holding screenshots',
            }
        },
        required: [
            'hostname',
            'port',
            'path',
            'username',
            'url'
        ]
    };

    this._settings = main.settings;
}

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