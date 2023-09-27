import { app, shell, BrowserWindow, session, systemPreferences } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import CarplayNode, {DEFAULT_CONFIG, CarplayMessage} from "node-carplay/node";

let mainWindow: BrowserWindow
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-webusb-security', 'true')
console.log(app.commandLine.hasSwitch('disable-webusb-security'))
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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

  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {

      // Add logic here to determine if permission should be given to allow HID selection
      return true
  })

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    console.log("permission check", details)
    if(details.device.vendorId === 4884) {
      console.log('returning true')
      return true
    } else {
      return false
    }

  })


  mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
    console.log("select devices")
    event.preventDefault()
    const selectedDevice = details.deviceList.find((device) => {
      console.log("returning device", device)
      return device.vendorId === 4884 && device.productId === 5408
    })
    console.log("check device callback", selec)
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
    details.responseHeaders['Cross-Origin-Opener-Policy'] = ['same-origin'];
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = ['require-corp'];
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
