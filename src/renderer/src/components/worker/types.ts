import { DongleConfig, TouchAction, CarplayMessage, AudioData } from 'node-carplay/web'

export type AudioPlayerKey = string & { __brand: 'AudioPlayerKey' }

export type CarplayWorkerMessage =
  | { data: CarplayMessage }
  | { data: { type: 'requestBuffer'; message: AudioData } }

export type InitialisePayload = {
  videoPort: MessagePort
  microphonePort: MessagePort
}

export type AudioPlayerPayload = {
  sab: SharedArrayBuffer
  decodeType: number
  audioType: number
}

export type StartPayload = {
  config: Partial<DongleConfig>
}

export type KeyCommand = 'left' |
  'right' |
  'selectDown' |
  'selectUp' |
  'back' |
  'down' |
  'home' |
  'play' |
  'pause' |
  'next' |
  'prev'

export type Command =
  | { type: 'stop' }
  | { type: 'start'; payload: Partial<DongleConfig> }
  | { type: 'touch'; payload: { x: number; y: number; action: TouchAction } }
  | { type: 'initialise'; payload: InitialisePayload }
  | { type: 'audioBuffer'; payload: AudioPlayerPayload }
  | { type: 'microphoneInput'; payload: Int16Array }
  | { type: 'frame'}
  | { type: 'keyCommand', command: KeyCommand}

export interface CarPlayWorker
  extends Omit<Worker, 'postMessage' | 'onmessage'> {
  postMessage(message: Command, transfer?: Transferable[]): void
  onmessage: ((this: Worker, ev: CarplayWorkerMessage) => any) | null
}
