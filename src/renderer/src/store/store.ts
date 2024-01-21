import { create } from 'zustand'
import { ExtraConfig } from "../../../main/Globals";
import { io } from 'socket.io-client'
import { Source, Stream } from "socketmost/dist/modules/Messages";
import { MessageNames } from "../../../main/Socket";

interface CarplayStore {
  settings: null | ExtraConfig,
  saveSettings: (settings: ExtraConfig) => void
  getSettings: () => void
  stream: (stream: Stream) => void
  startRecord: (data: Source) => void
  stopRecord: (data: Source) => void
}

interface StatusStore {
  reverse: boolean,
  lights: boolean,
  setReverse: (reverse: boolean) => void
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
  },
  startRecord: (data: Source) => {
    socket.emit(MessageNames.StartRecord, data)
  },
  stopRecord: (data: Source) => {
    socket.emit(MessageNames.StopRecord, data)
  }
}))

export const useStatusStore = create<StatusStore>()((set) => ({
  reverse: false,
  lights: false,
  setReverse: (reverse) => {
    set(() => ({reverse: reverse}))
  }
}))

const URL = 'http://localhost:4000'
const socket = io(URL)

socket.on('settings', (settings: ExtraConfig) => {
  console.log("received settings", settings)
  useCarplayStore.setState(() => ({settings: settings}))
})

socket.on('reverse', (reverse) => {
  console.log("reverse data", reverse)
  useStatusStore.setState(() => ({reverse: reverse}))
})




