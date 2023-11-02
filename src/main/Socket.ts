import { ExtraConfig } from "./Globals";
import { Server } from 'socket.io'

export enum MessageNames {
  Connection = 'connection',
  GetSettings = 'getSettings',
  SaveSettings = 'saveSettings'
}

export class Socket {
  config: ExtraConfig
  io: Server
  saveSettings: (settings: ExtraConfig) => void
  constructor(config: ExtraConfig, saveSettings: (settings: ExtraConfig) => void) {
    this.config = config
    this.saveSettings = saveSettings
    this.io = new Server({
      cors: {
        origin: '*'
      }
    })

    this.io.on(MessageNames.Connection, (socket) => {
      this.sendSettings()

      socket.on(MessageNames.GetSettings, () => {
        this.sendSettings()
      })

      socket.on(MessageNames.SaveSettings, (settings: ExtraConfig) => {
        this.saveSettings(settings)
      })
    })

    this.io.listen(4000)
  }

  sendSettings() {
    this.io.emit('settings', this.config)
  }
}
