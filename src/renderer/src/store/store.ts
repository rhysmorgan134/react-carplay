import { create } from 'zustand'
import { ExtraConfig } from "../../../main/Globals";
import { io } from 'socket.io-client'
import { Stream } from "socketmost/dist/modules/Messages";

interface CarplayStore {
  settings: null | ExtraConfig,
  saveSettings: (settings: ExtraConfig) => void
  getSettings: () => void
  stream: (stream: Stream) => void
}

interface StatusStore {
  reverse: boolean,
  lights: boolean,
}

export const useCarplayStore = create<CarplayStore>()((set) =>({
  settings: null,
  saveSettings: (settings) => {
    set(() => ({settings: settings}))
    socket.emit('saveSettings', settings)
  },
  getSettings: () => {
    socket.emit('getSettings')
  },
  stream: (stream) => {
    socket.emit('stream', stream)
  }
}))

const URL = 'http://localhost:4000'
const socket = io(URL)

socket.on('settings', (settings: ExtraConfig) => {
  console.log("received settings", settings)
  useCarplayStore.setState(() => ({settings: settings}))
})




