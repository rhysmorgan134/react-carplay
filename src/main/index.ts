import { app, shell, BrowserWindow, session, systemPreferences, IpcMainEvent, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { DEFAULT_CONFIG } from 'node-carplay/node'
import { Socket } from './Socket'
import * as fs from 'fs';

// comment below line to allow running on non linux devices
import {Canbus} from "./Canbus"

import { ExtraConfig, KeyBindings } from "./Globals";
// import CarplayNode, {DEFAULT_CONFIG, CarplayMessage} from "node-carplay/node";

let mainWindow: BrowserWindow
const appPath: string = app.getPath('userData')
const configPath: string = appPath + '/config.json'
console.log(configPath)
let config: null | ExtraConfig

const DEFAULT_BINDINGS: KeyBindings = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  selectDown: 'Space',
  back: 'Backspace',
  down: 'ArrowDown',
  home: 'KeyH',
  play: 'KeyP',
  pause: 'KeyO',
  next: 'KeyM',
  prev: 'KeyN'
}

const EXTRA_CONFIG: ExtraConfig = {
  ...DEFAULT_CONFIG,
  kiosk: true,
  camera: '',
  microphone: '',
  piMost: false,
  canbus: false,
  bindings: DEFAULT_BINDINGS,
  most: {},
  canConfig: {}
}

// comment below line to allow running on non linux devices
let canbus: null | Canbus

let socket: null | Socket

fs.exists(configPath, (exists) => {
    if(exists) {
      config = JSON.parse(fs.readFileSync(configPath).toString())
      let configKeys = JSON.stringify(Object.keys({...config}).sort())
      let defaultKeys =  JSON.stringify(Object.keys({...EXTRA_CONFIG}).sort())
      if(configKeys !== defaultKeys) {
        console.log("config updating")
        config = {...EXTRA_CONFIG, ...config}
        console.log("new config", config)
        fs.writeFileSync(configPath, JSON.stringify(config))
      }
      console.log("config read")
    } else {
      fs.writeFileSync(configPath, JSON.stringify(EXTRA_CONFIG))
      config = JSON.parse(fs.readFileSync(configPath).toString())
      console.log("config created and read")
    }
    socket = new Socket(config!, saveSettings)
    // comment below if statement to allow running on non linux devices
    if(config!.canbus) {
      console.log("Configuring can", config!.canConfig)
      canbus = new Canbus('can0',  socket, config!.canConfig)
      canbus.on('lights', (data) => {
        console.log('lights', data)
      })
      canbus.on('reverse', (data) => {
        mainWindow?.webContents?.send('reverse', data)
      })
    }

})

const handleSettingsReq = (_: IpcMainEvent ) => {
  console.log("settings request")
  mainWindow?.webContents.send('settings', config)
}


app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-webusb-security', 'true')
console.log(app.commandLine.hasSwitch('disable-webusb-security'))
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: config!.width,
    height: config!.height,
    kiosk: config!.kiosk,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#121212',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false
    }
  })
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

  // mainWindow.webContents.session.setDevicePermissionHandler((details) => {
  //   if (true) {
  //     if (details.device.vendorId === 4884 && details.device.productId === 5408) {
  //       // Always allow this type of device (this allows skipping the call to `navigator.hid.requestDevice` first)
  //       return true
  //     }
  //   }
  //   return false
  // })

  mainWindow.webContents.session.setPermissionCheckHandler(() => {
      return true
  })

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if(details.device.vendorId === 4884) {
      return true
    } else {
      return false
    }

  })


  mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
    event.preventDefault()
    const selectedDevice = details.deviceList.find((device) => {
      return device.vendorId === 4884 && (device.productId === 5408 || device.productId === 5409)
    })

    callback(selectedDevice?.deviceId)
  })
  // app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })



  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  systemPreferences.askForMediaAccess("microphone")
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders!['Cross-Origin-Opener-Policy'] = ['same-origin'];
    details.responseHeaders!['Cross-Origin-Embedder-Policy'] = ['require-corp'];
    callback({ responseHeaders: details.responseHeaders });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required")
app.whenReady().then(() => {

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // const carplay = new CarplayNode(DEFAULT_CONFIG)
  //
  // carplay.start()
  // carplay.onmessage = (message: CarplayMessage) => {
  //
  //   if (message.type === 'audio') {
  //     mainWindow.webContents.send('audioData', message.message)
  //   }
  // }
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    })
  })

  ipcMain.on('getSettings', handleSettingsReq)

  ipcMain.on('saveSettings', saveSettings)

  // ipcMain.on('startStream', startMostStream)

  ipcMain.on('quit', quit)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

const saveSettings = (settings: ExtraConfig) => {
  console.log("saving settings", settings)
  fs.writeFileSync(configPath, JSON.stringify(settings))
  app.relaunch()
  app.exit()
}

// const startMostStream = (_: IpcMainEvent, most: Stream) => {
//   console.log("stream request")
//   if(piMost) {
//     piMost.stream(most)
//   }
// }

const quit = (_: IpcMainEvent) => {
  app.quit()
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
