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
  reverse: boolean
  lights: boolean
  constructor(canChannel: string, subscriptions: CanConfig = {}) {
    super();
    this.canChannel = canChannel
    this.subscriptions = subscriptions
    this.channel = can.createRawChannel(this.canChannel)
    this.masks = []
    this.reverse = false
    this.lights = false
    Object.keys(this.subscriptions).forEach((sub) => {
      this.masks.push({id: this.subscriptions[sub].canId, mask: this.subscriptions[sub].canId, invert: false})
    })
    this.channel.setRxFilters(this.masks)

    this.channel.addListener("onMessage", (msg) => {
      let data
      switch (msg.id) {
        case this.subscriptions?.reverse?.canId:
          data = msg.data[this.subscriptions!.reverse!.byte] & this.subscriptions!.reverse!.mask
          let tempReverse = this.reverse
          if (data) {
            tempReverse = true
          } else {
            tempReverse = false
          }
          if(tempReverse !== this.reverse) {
            this.emit('reverse', this.reverse)
          }
          break
        case this.subscriptions?.lights?.canId:
          let tempLights = this.lights
          data = msg.data[this.subscriptions!.reverse!.byte] & this.subscriptions!.reverse!.mask
          if (data) {
            tempLights = true
          } else {
            tempLights = false
          }
          if(tempLights !== this.lights) {
            this.emit('lights', this.lights)
          }
          break
      }
    })

    this.channel.start()

  }
}
