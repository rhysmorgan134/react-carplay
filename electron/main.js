const path = require('path');
const url = require('url');
const {app, BrowserWindow, ipcMain, ipcRenderer, globalShortcut} = require('electron');
const {channels} = require('../src/shared/constants');
const { Readable } = require('stream');
const isDev = require('electron-is-dev');
const Settings = require('./SettingsStore')
const WebSocket = require('ws');
const mp4Reader = new Readable({
    read(size) {
    }
});
console.log(app.getPath('userData'))
const settings = new Settings()
const Carplay = require('node-carplay')
const keys = require('./bindings.json')
let buffers = []

let mainWindow;

function createWindow() {
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true,
    });

    globalShortcut.register('f5', function () {
        console.log('f5 is pressed')
        mainWindow.webContents.openDevTools()
    })
    if(isDev || !(settings.store.get('kiosk'))) {
        mainWindow = new BrowserWindow({
            width: settings.store.get('width'), height: settings.store.get('height'), frame: true, webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: false
            }
        });
    } else {
        mainWindow = new BrowserWindow({
            width: 800, height: 480, kiosk: true, webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: false
            }
        });
    }

    mainWindow.loadURL(startUrl);
    let size = mainWindow.getSize()
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    const config = {
        dpi: settings.store.get('dpi'),
        nightMode: 0,
        hand: settings.store.get('lhd'),
        boxName: 'nodePlay',
        width: size[0],
        height: size[1],
        fps: settings.store.get('fps'),
    }
    console.log("spawning carplay", config)
    const carplay = new Carplay(config)

    carplay.on('quit', () => {
        console.log("sending quit req")
        mainWindow.webContents.send('quitReq')
    })

    ipcMain.on('click', (event, data) => {
        carplay.sendTouch(data.type, data.x, data.y)
        console.log(data.type, data.x, data.y)
    })

    ipcMain.on('statusReq', (event, data) => {
        if(carplay.getStatus()) {
            mainWindow.webContents.send('plugged')
        } else {
            mainWindow.webContents.send('unplugged')
        }
    })

    ipcMain.on("fpsReq", (event) => {
        event.returnValue = settings.store.get('fps')
    })

    ipcMain.on('getSettings', () => {
        mainWindow.webContents.send('allSettings', settings.store.store)
    })

    ipcMain.on('settingsUpdate', (event, {type, value}) => {
        console.log("updating settings", type, value)
        settings.store.set(type, value)
        mainWindow.webContents.send('allSettings', settings.store.store)
    })

    ipcMain.on('reqReload', (event) => {
        app.relaunch()
        app.quit()
    })

    for (const [key, value] of Object.entries(keys)) {
        if(isDev) {
            return
        }
        globalShortcut.register(key, function () {
            carplay.sendKey(value)
	    if(value==="selectDown"){
	        setTimeout(()=>{
		   carplay.sendKey("selectUp")
		}, 200)
	    }
        })
    }

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



