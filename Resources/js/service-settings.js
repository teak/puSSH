function ServiceSettings() {
    this.saveSettings = function(data) {
        var _self = this;

        var options = Object.keys(data);
        
        options.forEach(function(option) {
            if(option === 'password') {
                _self.setPassword(option, data[option]);
            } else {
                _self.setSetting(option, data[option]);
            }
        });
    };

    this.getSettings = function() {
        var _self = this;

        var options = Object.keys(_self.schema.properties);

        var out = {};
        options.forEach(function(option) {
            if(option === 'password') {
                out[option] = _self.getPassword(option);
            } else {
                out[option] = _self.getSetting(option);
            }
        });

        return out;
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
}

module.exports = ServiceSettings;