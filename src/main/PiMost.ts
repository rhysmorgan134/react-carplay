import { SocketMostUsb } from 'socketmost'
import { MostRxMessage, Os8104Events, Stream } from "socketmost/dist/modules/Messages";
import { MessageNames, Socket } from "./Socket";
const { exec } = require("child_process");

export class PiMost {
  socketMost: SocketMostUsb
  socket: Socket
  constructor(socket: Socket) {
    console.log("creating client in PiMost")
    this.socketMost = new SocketMostUsb()
    this.socket = socket

    this.socketMost.on(Os8104Events.MostMessageRx, (message: MostRxMessage) => {

    })

    this.socketMost.on(Os8104Events.Shutdown, () => {
      exec('sudo shutdown now')
    })

    this.socket.on('forceSwitch', () => {
      this.socketMost.forceSwitch()
    })
  }
}


