function Settings() {
    this.settings = require('./settings.json');
    this.keychain = require('keytar');

    this.load();
}

Settings.prototype.parseType = function(value) {
    if(value == null) {
        return null;
    } else if(value === "true") {
        return true;
    } else if(value === "false") {
        return false;
    } else if(!isNaN(value)) {
        return value.indexOf('.') > -1 ? parseFloat(value) : parseInt(value);
    } else {
        return decodeURIComponent(value);
    }
}

Settings.prototype.load = function() {
    var settingsList = Object.keys(window.localStorage);
    var _self = this;

    settingsList.forEach(function(name) {
        if(window.localStorage.getItem(name)) {
            _self.settings[name] = _self.parseType(window.localStorage.getItem(name));
        }
    });
}

Settings.prototype.save = function() {
    var settingsList = Object.keys(this.settings);
    var _self = this;

    settingsList.forEach(function(name) {
        _self.set(name, _self.settings[name]);
    });
}

Settings.prototype.get = function(name) {
    return name ? this.settings[name] : this.settings;
}

Settings.prototype.set = function(name, value) {
    this.settings[name] = value;

    value = encodeURIComponent(value);
    window.localStorage.setItem(name, value);
}

Settings.prototype.getPassword = function(service) {
    return this.keychain.getPassword('pussh', service);
}

Settings.prototype.setPassword = function(service, password) {
    if (!password || password == '') {
        this.keychain.deletePassword('pussh', service);
        return;
    } else if (this.keychain.getPassword('pussh', service)) {
        this.keychain.replacePassword('pussh', service, password);
    } else {
        this.keychain.addPassword('pussh', service, password);
    }
}

module.exports = Settings;
