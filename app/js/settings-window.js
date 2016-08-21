'use strict';

const app = angular.module('settingsWindow', []);

const remote = require('electron').remote;

app.run(function($rootScope) {
    $rootScope.Platform = require('os').platform();
    $rootScope.Electron = remote.app;
    $rootScope.AppName = $rootScope.Electron.getName();
    $rootScope.Version = $rootScope.Electron.getVersion();
    $rootScope.Window = remote.getCurrentWindow();
    $rootScope.Pussh = remote.getGlobal('Pussh');

    $rootScope.Window.focus();
});

app.controller('settings', function($scope, $rootScope) {
    const Pussh = $rootScope.Pussh;

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
    }, 1000);
});

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
