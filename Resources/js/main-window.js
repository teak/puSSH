'use strict';

var gui = require('nw.gui');

var Window = gui.Window.get();
var AppName = gui.App.manifest.name;



// angular
var app = angular.module('mainWindow', []);

app.run(function($rootScope) {
    $rootScope.AppName = AppName;
});


// setup tray menu
var tray = new gui.Tray({
    title: 'pussh',
    icon: '../img/icon.png'
});
var menu = new gui.Menu();
var item;

// open settings
item = new gui.MenuItem({
    label: 'Settings',
    click: function() {
        Window.show();
        Window.focus();
    }
});
menu.append(item);

// quit app
item = new gui.MenuItem({
    label: 'Quit ' + AppName,
    click: function() {
        gui.App.quit();
    }
});
menu.append(item);

tray.menu = menu;


// manage window
Window.on('close', function () {
    this.hide();
});


// check password
var keychain = require('keychain');

keychain.getPassword({ account: localStorage.accountName, service: 'puushApp' }, function(err, pass) {
    if (err) {
        Window.show();
    }
});


var sys = require('sys');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var watch = require('watch');

var desktopFolder = path.join(process.env['HOME'], 'Desktop');
var trashFolder = path.join(process.env['HOME'], '.Trash');

watch.createMonitor(desktopFolder, function (monitor) {
    monitor.on("created", function (filePath, stat) {
        var child = exec('mdls --raw --name kMDItemIsScreenCapture "'+filePath+'"', function (error, stdout, stderr) {
            if (error) return;

            if (stdout == '1') {
                fs.rename(filePath, trashFolder+'/'+path.basename(filePath), function(err) {
                    if (err) {
                        console.log('failed to delete file. error: ' + err);
                    };
                });
                console.log(filePath+' is a screenshot! (and in the trash)');
            } else {
                console.log(filePath+' is NOT a screenshot!');
            }

        });
    });
});
