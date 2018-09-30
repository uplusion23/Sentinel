var globalStrings = {
  version: require('./package.json').version,
  appname: require('./package.json').name
}

var win = nw.Window.get();
var childWin = null;
win.title = globalStrings.appname + " Launcher";
$("#startingStr").text("Starting " + globalStrings.appname + " v" + globalStrings.version + ": Precaching...");
win.setResizable(false);
win.width = 920;
win.height = 440;
win.setAlwaysOnTop(true);
win.showDevTools()

var devReloadConfc = {
  key : "Ctrl+F11"
};

var devReload = new nw.Shortcut(devReloadConfc);
nw.App.registerGlobalHotKey(devReload);

devReload.on('active', function() {
  console.log("Global desktop keyboard shortcut: " + this.key + " active.");
  win.reload();
  devReload.active = false;
  nw.App.unregisterGlobalHotKey(devReload);
});
devReload.on('failed', function(msg) {
  console.log(msg);
});

function windowReady() {
  childWin.show();
  win.close();
}

function updateLoadStr(str) {
  $("#startingStr").text("Starting " + globalStrings.appname + " v" + globalStrings.version + ": " + str);
}

setTimeout(function() {
  var appOpt = {
    'min_width': 1408,
    'min_height': 792,
    'icon': 'assets/img/sentinel_logo.png',
    'show': false
  }
  nw.Window.open('main.html', appOpt, function(mainWindow) {
    childWin = mainWindow;
    childWin.showDevTools();
  });
}, 100);
