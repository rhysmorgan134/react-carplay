const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const { channels } = require('../src/shared/constants');
const ws = require('./ws')
ws.ws()
const Carplay = require('node-carplay')


let mainWindow;
function createWindow () {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });

  globalShortcut.register('f5', function() {
    console.log('f5 is pressed')
    mainWindow.webContents.openDevTools()
})

  mainWindow = new BrowserWindow({ width: 800, height: 600, kiosk: true, webPreferences : {
	preload: path.join(__dirname, 'preload.js'),
	contextIsolation: false
}});
  mainWindow.loadURL(startUrl);
  let size = mainWindow.getSize()
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  const config = {
      dpi: 240,
      nightMode: 0,
      hand: 0,
      boxName: 'nodePlay',
      width: size[0],
      height: size[1],
      fps: 30,
  }
  console.log("spawning carplay", config)
  const carplay = new Carplay(config)
  ipcMain.on('click', (event, data) => {
    	  carplay.sendTouch(data.type, data.x, data.y)
	  console.log(data.type, data.x, data.y)
  })
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});


