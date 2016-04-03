var app = require('app');
var fs = require('fs');
var path = require('path');

function Services(main) {
    this.settings = main.settings;
    this.services = {};

    this.load();
}

Services.prototype.load = function() {
    var _self = this;
    fs.readdirSync(path.join(app.getAppPath(), 'js', 'services')).forEach(function(file) {
        if(!/\.js$/.test(file)) return;

        var module = require(path.join(app.getAppPath(), 'js', 'services', file));

        var initModule = new module(_self);

        _self.services[initModule._name] = initModule;
    });
}

Services.prototype.list = function() {
    var list = [];

    var _self = this;
    Object.keys(this.services).forEach(function(service) {
        list.push(_self.services[service]);
    });

    return list;
}

Services.prototype.get = function(name) {
    return this.services[name];
}

Services.prototype.set = function(name, data) {
    return this.services[name].save(data);
}

module.exports = Services;
