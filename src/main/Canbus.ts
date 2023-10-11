// import {Message} from "*can.node";
import * as can from "socketcan";
import EventEmitter from 'events'
import { CanConfig } from "./Globals";

type CanMask = {
  id: number,
  mask: number,
  invert: boolean
}


export class Canbus extends EventEmitter {
  channel: can.channel
  canChannel: string
  subscriptions: CanConfig
  masks: CanMask[]
  constructor(canChannel: string, subscriptions: CanConfig = {}) {
    super();
    this.canChannel = canChannel
    this.subscriptions = subscriptions
    this.channel = can.createRawChannel(this.canChannel)
    this.masks = []
    Object.keys(this.subscriptions).forEach((sub) => {
      this.masks.push({id: this.subscriptions[sub].canId, mask: this.subscriptions[sub].canId, invert: false})
    })
    this.channel.setRxFilters(this.masks)

    this.channel.addListener("onMessage", (msg) => {
      switch (msg.id) {
        case this.subscriptions?.reverse?.canId:
          this.emit('reverse', msg.data[this.subscriptions!.reverse!.byte] & this.subscriptions!.reverse!.mask)
          break
        case this.subscriptions?.lights?.canId:
          this.emit('reverse', msg.data[this.subscriptions!.lights!.byte] & this.subscriptions!.lights!.mask)
          break
      }
    })

    this.channel.start()

  }
}
