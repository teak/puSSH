function Settings() {
    this.settings = require('./settings.json');

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

module.exports = Settings;