'use strict';

var app = angular.module('settingsWindow', ['schemaForm']);

app.run(function($rootScope) {
    $rootScope.GUI = require('nw.gui');
    $rootScope.AppName = $rootScope.GUI.App.manifest.name;
    $rootScope.Version = $rootScope.GUI.App.manifest.version;
    $rootScope.Window = $rootScope.GUI.Window.get();
    $rootScope.Pussh = global.Pussh;
});

app.controller('settings', function($scope, $rootScope) {
    var Pussh = $rootScope.Pussh;

    $scope.services = Pussh.services.list();
    $scope.settings = Pussh.settings.get();
    $scope.selectedService = Pussh.services.get($scope.settings.selectedService);
    $scope.serviceSettings = $scope.selectedService.getSettings();

    $scope.$watch('selectedService', function(service) {
        $scope.settings.selectedService = service._name;
        $scope.serviceSettings = $scope.selectedService.settings;

        Pussh.settings.save();
    });

    $scope.$watch('settings', function() {
        Pussh.settings.save();
    }, true);

    $scope.$watch('serviceSettings', function() {
        $scope.selectedService.saveSettings();
    }, true);
});
