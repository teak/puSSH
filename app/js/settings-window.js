'use strict';

var app = angular.module('settingsWindow', []);

app.run(function($rootScope) {
    $rootScope.Platform = require('os').platform();
    var remote = require('remote');
    $rootScope.Electron = remote.require('app');
    $rootScope.AppName = $rootScope.Electron.getName();
    $rootScope.Version = $rootScope.Electron.getVersion();
    $rootScope.Window = remote.getCurrentWindow();
    $rootScope.Pussh = remote.getGlobal('Pussh');

    $rootScope.Window.focus();
});

app.controller('settings', function($scope, $rootScope) {
    var Pussh = $rootScope.Pussh;

    $scope.services = Pussh.services.list();
    $scope.settings = Pussh.settings.get();
    $scope.selectedService = Pussh.services.get($scope.settings.selectedService);
    $scope.serviceSettings = $scope.selectedService.getSettings();
    $scope.autoLaunchSetting = false;

    Pussh.settings.getAutoLaunch(function(state) {
        $scope.autoLaunchSetting = state;
        $scope.$apply();

        $scope.$watch('autoLaunchSetting', function() {
            Pussh.settings.setAutoLaunch($scope.autoLaunchSetting);
        });
    });

    $scope.resetAll = function() {
        Pussh.settings.resetAll();
    }

    $scope.$watch('selectedService', function(service) {
        $scope.settings.selectedService = service._name;
        $scope.serviceSettings = $scope.selectedService.settings;

        $scope.save();
    });

    $scope.$watch('settings', function() {
        $scope.save();
    }, true);

    $scope.$watch('serviceSettings', function() {
        $scope.save();
    }, true);

    $scope.save = debounce(function() {
        $scope.selectedService.saveSettings();
        Pussh.settings.save();
        console.log('asdf');
    }, 1000);
});

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
