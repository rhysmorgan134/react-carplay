import { SocketMost, SocketMostClient } from 'socketmost'
import { Stream } from "socketmost/dist/modules/Messages";
import { MessageNames, Socket } from "./Socket";

export class PiMost {
  socketMost: SocketMost
  socketMostClient: SocketMostClient
  socket: Socket
  constructor(socket: Socket) {
    console.log("creating client in PiMost")
    this.socketMost = new SocketMost()
    this.socketMostClient = new SocketMostClient()
    this.socket = socket

    this.socket.on(MessageNames.Stream, (stream) => {
      this.stream(stream)
    })
  }

  stream(stream: Stream) {
    this.socketMostClient.stream(stream)
  }
}


