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
      videoData: (callback: Function) => ipcRenderer.on('videoData', callback),
      removeVideoData: (callback: Function) => ipcRenderer.removeAllListeners('videoData'),
      audioData: (callback: Function) => ipcRenderer.on('audioData', callback),
      status: (callback: Function) => ipcRenderer.on('status', callback),
      getStatus: () => ipcRenderer.invoke('getStatus'),
      sendTouch: (data: { type: number; x: number; y: number }) => ipcRenderer.invoke('sendTouch', data)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
