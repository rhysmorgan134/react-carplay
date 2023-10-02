import {Message} from "*can.node";
import * as can from "socketcan";
import EventEmitter from 'events'


export class Canbus extends EventEmitter {
  channel = can.channel
  constructor() {
    super();
  }
}
