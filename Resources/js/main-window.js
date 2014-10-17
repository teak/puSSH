'use strict';

var app = angular.module('mainWindow', []);

app.run(function($rootScope) {
    $rootScope.GUI = require('nw.gui');
    $rootScope.AppName = $rootScope.GUI.App.manifest.name;
    $rootScope.Window = $rootScope.GUI.Window.get();
});


var sys = require('sys');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var watch = require('watch');

var desktopFolder = path.join(process.env['HOME'], 'Desktop');

watch.createMonitor(desktopFolder, function (monitor) {
    monitor.on("created", function (f, stat) {
        var filePath = f;
        var child = exec('mdls --raw --name kMDItemIsScreenCapture "'+filePath+'"', function (error, stdout, stderr) {
            if (stdout == '1') {
                alert(filePath+' is a screenshot!');
            } else {
                alert(filePath+' is NOT a screenshot!');
            }
            if (error) {
                alert('exec error: ' + error);
            }
        });
    });
});
