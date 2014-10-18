'use strict';

var app = angular.module('settingsWindow', []);

app.run(function($rootScope) {
    $rootScope.GUI = require('nw.gui');
    $rootScope.AppName = $rootScope.GUI.App.manifest.name;
    $rootScope.Window = $rootScope.GUI.Window.get();
    $rootScope.Pussh = global.Pussh;
});

app.controller('settings', function($scope, $rootScope) {
    var Pussh = $rootScope.Pussh;

    $scope.services = Pussh.services.list();
    $scope.settings = Pussh.settings.get();
    $scope.selectedService = Pussh.services.get($scope.settings.selectedService);

    $scope.$watch('selectedService', function(value) {
        $scope.settings.selectedService = value._name;
    });

    $scope.$watch('settings', function() {
        Pussh.settings.save();
    }, true);
});