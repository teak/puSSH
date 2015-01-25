var fs = require('fs');
var path = require('path');

function Services(main) {
    this.settings = main.settings;
    this._services = {};

    this.load();
}

Services.prototype.load = function() {
    var _self = this;
    fs.readdirSync(path.join(process.cwd(), 'Resources', 'js', 'services')).forEach(function(file) {
        if(!/\.js$/.test(file)) return;

        var module = require(path.join(process.cwd(), 'Resources', 'js', 'services', file));

        var initModule = new module(_self);

        _self._services[initModule._name] = initModule;
    });
}

Services.prototype.list = function() {
    var list = [];

    var _self = this;
    Object.keys(this._services).forEach(function(service) {
        list.push(_self._services[service]);
    });

    return list;
}

Services.prototype.get = function(name) {
    return this._services[name];
}

Services.prototype.set = function(name, data) {
    return this._services[name].save(data);
}

module.exports = Services;
