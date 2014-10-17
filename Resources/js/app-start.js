var gui = require('nw.gui');

var menu = new gui.Menu({ type: 'menubar' });
if (process.platform === 'darwin') {
    menu.createMacBuiltin('');
}
gui.Window.get().menu = menu;


var tray = new gui.Tray({ title: 'pussh', icon: '../img/icon.png' });

var menu = new gui.Menu();

var item = new gui.MenuItem({
    label: "Quit",
    click: function() {
    	gui.App.quit();
    }
});

menu.append(item);

tray.menu = menu;

window.location = 'main-window.html';
