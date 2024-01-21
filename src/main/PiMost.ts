import { SocketMost, SocketMostClient } from 'socketmost'
import { Source, Stream } from "socketmost/dist/modules/Messages";
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

    this.socket.on(MessageNames.StartRecord, (data) => {
      this.connectMic(data)
    })

    this.socket.on(MessageNames.StopRecord, (data) => {
      this.disconnectMic(data)
    })
  }

  stream(stream: Stream) {
    this.socketMostClient.stream(stream)
  }

  connectMic(data: Source) {
    this.socketMostClient.connectSource(data)
  }

  disconnectMic(data: Source) {
    this.socketMostClient.disconnectSource(data)
  }
}


