function ServiceSettings() {
    this.saveSettings = function() {
        var _self = this;

        this.settings.forEach(function(option) {
            if(option.password) {
                _self.setPassword(option.key, option.value);
            } else {
                _self.setSetting(option.key, option.value);
            }
        });
    };

    this.getSettings = function() {
        return this.settings;
    }

    this.getSetting = function(key) {
        return this._settings.get(this._name+'_'+key);
    }

    this.setSetting = function(key, value) {
        return this._settings.set(this._name+'_'+key, value);
    }

    this.getPassword = function(key) {
        return this._settings.getPassword(this._name+'_'+key);
    }

    this.setPassword = function(key, password) {
        return this._settings.setPassword(this._name+'_'+key, password);
    }

    // Loads settings at service initialization
    this.loadSettings = function() {
        var _self = this;
        this.settings.forEach(function(option) {
            if(option.password) {
                option.value = _self.getPassword(option.key);
            } else {
                option.value = _self.getSetting(option.key) || option.default;
            }
        });
    }
}

module.exports = ServiceSettings;
