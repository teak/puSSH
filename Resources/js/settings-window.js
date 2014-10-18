'use strict';

var app = angular.module('settingsWindow', []);

app.run(function($rootScope) {
    $rootScope.GUI = require('nw.gui');
    $rootScope.AppName = $rootScope.GUI.App.manifest.name;
    $rootScope.Window = $rootScope.GUI.Window.get();
});
