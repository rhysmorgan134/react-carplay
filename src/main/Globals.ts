import { Source, Stream } from "socketmost/dist/modules/Messages";
import { DongleConfig } from 'node-carplay/node'

export type Most = {
  stream?: Stream
  mic?: Source
}

export type ExtraConfig = DongleConfig & {
  kiosk: boolean,
  camera: string,
  microphone: string,
  piMost: boolean,
  canbus: boolean,
  bindings: KeyBindings,
  most?: Most,
  canConfig?: CanConfig
}

export interface KeyBindings {
  'left': string,
  'right': string,
  'selectDown': string,
  'back': string,
  'down': string,
  'home': string,
  'play': string,
  'pause': string,
  'next': string,
  'prev': string
}

export interface CanMessage {
  canId: number,
  byte: number,
  mask: number
}

export interface CanConfig {
  reverse?: CanMessage,
  lights?: CanMessage
}
