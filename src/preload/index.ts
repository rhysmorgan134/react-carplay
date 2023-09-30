// import {
//   contextBridge,
//   createIpcRenderer,
//   GetApiType,
// } from 'electron-typescript-ipc';
// import type {CarplayMessage} from 'node-carplay/node'
//
// const ipcRenderer = createIpcRenderer<Api>()
//
// export type Api = GetApiType<
//   {
//     getFrame: () => void
//   },
//   {
//     message: (message :CarplayMessage) => void
//   }
// >
//
// const api:Api = {
//   invoke: {
//     getFrame: () => {
//       console.log("frameRequest")
//     }
//   },
//   on: {
//     message: (listener) => {
//       ipcRenderer.on('message', listener)
//     }
//   }
// }
//
// contextBridge.exposeInMainWorld('myAPI', api)
//
// declare global {
//   interface Window {
//     myAPI: Api;
//   }
// }
//
import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from '@electron-toolkit/preload'
import { ExtraConfig } from "../main";

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      settings: (callback: Function) => ipcRenderer.on('settings', callback),
      getSettings: () => ipcRenderer.send('getSettings'),
      saveSettings: (settings: ExtraConfig) => ipcRenderer.send('saveSettings', settings)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
