import CarplayWeb, {
  CarplayMessage,
  DongleConfig,
  SendAudio,
  SendCommand,
  SendTouch,
  findDevice,
} from 'node-carplay/web'
import { AudioPlayerKey, Command } from './types'
import { RenderEvent } from './render/RenderEvents'
import { RingBuffer } from 'ringbuf.js'
import { createAudioPlayerKey } from './utils'

let carplayWeb: CarplayWeb | null = null
let videoPort: MessagePort | null = null
let microphonePort: MessagePort | null = null
let config: Partial<DongleConfig> | null = null
const audioBuffers: Record<AudioPlayerKey, RingBuffer<Int16Array>> = {}
const pendingAudio: Record<AudioPlayerKey, Int16Array[]> = {}

const handleMessage = (message: CarplayMessage) => {
  const { type, message: payload } = message
  if (type === 'video' && videoPort) {
    videoPort.postMessage(new RenderEvent(payload.data), [payload.data.buffer])
  } else if (type === 'audio' && payload.data) {
    const { decodeType, audioType } = payload
    const audioKey = createAudioPlayerKey(decodeType, audioType)
    if (audioBuffers[audioKey]) {
      audioBuffers[audioKey].push(payload.data)
    } else {
      if (!pendingAudio[audioKey]) {
        pendingAudio[audioKey] = []
      }
      pendingAudio[audioKey].push(payload.data)
      payload.data = undefined

      const getPlayerMessage = {
        type: 'getAudioPlayer',
        message: {
          ...payload,
        },
      }
      postMessage(getPlayerMessage)
    }
  } else {
    postMessage(message)
  }
}

onmessage = async (event: MessageEvent<Command>) => {
  switch (event.data.type) {
    case 'initialise':
      if (carplayWeb) return
      videoPort = event.data.payload.videoPort
      microphonePort = event.data.payload.microphonePort
      microphonePort.onmessage = ev => {
        if (carplayWeb) {
          const data = new SendAudio(ev.data)
          carplayWeb.dongleDriver.send(data)
        }
      }
      break
    case 'audioPlayer':
      const { sab, decodeType, audioType } = event.data.payload
      const audioKey = createAudioPlayerKey(decodeType, audioType)
      audioBuffers[audioKey] = new RingBuffer(sab, Int16Array)
      if (pendingAudio[audioKey]) {
        pendingAudio[audioKey].forEach(buf => {
          audioBuffers[audioKey].push(buf)
        })
        pendingAudio[audioKey] = []
      }
      break
    case 'start':
      if (carplayWeb) return
      config = event.data.payload.config
      const device = await findDevice()
      if (device) {
        carplayWeb = new CarplayWeb(config)
        carplayWeb.onmessage = handleMessage
        carplayWeb.start(device)
      }
      break
    case 'touch':
      if (config && carplayWeb) {
        const { x, y, action } = event.data.payload
        const data = new SendTouch(x, y, action)
        carplayWeb.dongleDriver.send(data)
      } else {
      }
      break
    case 'stop':
      await carplayWeb?.stop()
      carplayWeb = null
      break
    case 'frame':
      if (carplayWeb) {
        const data = new SendCommand('frame')
        carplayWeb.dongleDriver.send(data)
      }
      break
  }
}

export {}
