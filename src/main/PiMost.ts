import { SocketMost, SocketMostClient } from 'socketmost'
import { Stream } from "socketmost/dist/modules/Messages";

export class PiMost {
  socketMost: SocketMost
  socketMostClient: SocketMostClient
  constructor() {
    console.log("creating client in PiMost")
    this.socketMost = new SocketMost()
    this.socketMostClient = new SocketMostClient()

  }

  stream(stream: Stream) {
    this.socketMostClient.stream(stream)
  }
}


