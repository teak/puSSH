var path = require('path');
var app = require('app');
var fs = require('fs');

function Settings(main) {
    this.name = app.getName();
    this.storage = path.join(app.getPath('userData'), 'settings.json');
    this.settings = require(path.join(app.getAppPath(), 'settings.json'));
    //this.keychain = require('keytar');

    var AutoLaunch = require('auto-launch');
    this.autoLaunch = new AutoLaunch({
        name: this.name
    });

    this.load(true);
}

Settings.prototype.load = function(sync) {
    var _self = this;
    if (sync) {
        try {
            _self.settings = JSON.parse(fs.readFileSync(_self.storage, 'utf8'));
        } catch(error) {
            // file doesnt exist
        }
    } else {
        fs.readFile(_self.storage, 'utf8', function (error, data) {
            if (error) return;

            _self.settings = JSON.parse(data);
        });
    }
}

Settings.prototype.save = function(sync) {
    var _self = this;

    if (sync) {
        fs.writeFileSync(_self.storage, JSON.stringify(_self.settings, null, 2) , 'utf-8');
    } else {
        fs.writeFile(_self.storage, JSON.stringify(_self.settings, null, 2) , 'utf-8');
    }
}

Settings.prototype.get = function(name) {
    return name ? this.settings[name] : this.settings;
}

Settings.prototype.set = function(name, value) {
    this.settings[name] = value;
}

Settings.prototype.getPassword = function(service) {
    // return this.keychain.getPassword('pussh', service);
}

Settings.prototype.setPassword = function(service, password) {
    // if (!password || password == '') {
    //     this.keychain.deletePassword('pussh', service);
    // } else if (this.keychain.getPassword('pussh', service)) {
    //     this.keychain.replacePassword('pussh', service, password);
    // } else {
    //     this.keychain.addPassword('pussh', service, password);
    // }
}

Settings.prototype.setAutoLaunch = function(state) {
    var _self = this;
    
    _self.autoLaunch.isEnabled(function(enabled) {
        if (enabled && !state) {
            _self.autoLaunch.disable(function(error) {
                if (error) console.log(error);
            });
        } else if (!enabled && state) {
            _self.autoLaunch.enable(function(error) {
                if (error) console.log(error);
            });
        }
    });
}

Settings.prototype.getAutoLaunch = function(callback) {
    var _self = this;
    
    _self.autoLaunch.isEnabled(function(enabled) {
        callback(enabled);
    });
}

Settings.prototype.resetAll = function() {
    this.settings = require(path.join(app.getAppPath(), 'settings.json'));
    this.setAutoLaunch(false);

    //todo reset passwords

    this.save(true);
}

module.exports = Settings;
