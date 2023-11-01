import { useCallback, useEffect, useState } from 'react'
import '../App.css'
import {
  AudioCommand,
  AudioData,
  WebMicrophone,
  AudioFormat,
  decodeTypeMap,
} from 'node-carplay/web'
import { PcmPlayer } from 'pcm-ringbuf-player'
import { CarPlayWorker } from './worker/types'

//TODO: allow to configure
const defaultAudioVolume = 1
const defaultNavVolume = 0.5

const useCarplayAudio = (worker: CarPlayWorker, microphone: string | null = null) => {
  const [mic, setMic] = useState<WebMicrophone | null>(null)
  const [audioPlayers] = useState(new Map<string, PcmPlayer>())

  const getAudioPlayer = useCallback(
    (audio: AudioData): PcmPlayer => {
      const { decodeType, audioType } = audio
      const format = decodeTypeMap[decodeType]
      const audioKey = [format.frequency, format.channel, audioType].join('_')
      let player = audioPlayers.get(audioKey)
      if (player) return player
      player = new PcmPlayer(format.frequency, format.channel)
      audioPlayers.set(audioKey, player)
      player.volume(defaultAudioVolume)
      player.start()
      return player
    },
    [audioPlayers],
  )

  const processAudio = useCallback(
    (audio: AudioData) => {
      if (audio.data) {
        const { data } = audio
        const player = getAudioPlayer(audio)
        if(audio.volumeDuration) {
          console.log("duration in different place", audio)
        }
        player.feed(data)
      } else if (audio.volumeDuration) {
        const { volume, volumeDuration } = audio
        const player = getAudioPlayer(audio)
        console.log("changing audio volume", audio)
        console.log(parseFloat(audio.volumeDuration))
        player.volume(volume, volumeDuration)
      } else if (audio.command) {
        switch (audio.command) {
          case AudioCommand.AudioNaviStart:
            const navPlayer = getAudioPlayer(audio)
            navPlayer.volume(defaultNavVolume)
            break
          case AudioCommand.AudioMediaStart:
          case AudioCommand.AudioOutputStart:
            const mediaPlayer = getAudioPlayer(audio)
            mediaPlayer.volume(defaultAudioVolume)
            break
        }
      } else {
        console.log(audio)
      }
    },
    [getAudioPlayer],
  )

  // audio init
  useEffect(() => {
    const initMic = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {deviceId: microphone!, noiseSuppression: true, echoCancellation: true},
        })
        const mic = new WebMicrophone(mediaStream)
        mic.on('data', payload => {
          worker.postMessage(
            {
              type: 'microphoneInput',
              payload,
            },
            [payload.buffer],
          )
        })

        setMic(mic)
      } catch (err) {
        console.error('Failed to init microphone', err)
      }
    }

    if (microphone) initMic()

    return () => {
      audioPlayers.forEach(p => p.stop())
    }
  }, [audioPlayers, worker])

  const startRecording = useCallback(() => {
    mic?.start()
  }, [mic])

  const stopRecording = useCallback(() => {
    mic?.stop()
  }, [mic])

  return { processAudio, startRecording, stopRecording }
}

export default useCarplayAudio
