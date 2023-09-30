import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotatingLines } from 'react-loader-spinner'
//import './App.css'
import {
  findDevice,
  requestDevice,
  DongleConfig,
  CommandMapping,
} from 'node-carplay/web'
import JMuxer from 'jmuxer'
import { CarPlayWorker } from './worker/types'
import useCarplayAudio from './useCarplayAudio'
import { useCarplayTouch } from './useCarplayTouch'
import { useLocation, useNavigate } from "react-router-dom";

const width = window.innerWidth
const height = window.innerHeight

const config: Partial<DongleConfig> = {
  width,
  height,
  fps: 60,
  mediaDelay: 0,
}
const RETRY_DELAY_MS = 5000

function Carplay({ receivingVideo, setReceivingVideo, settings }) {
  const [isPlugged, setPlugged] = useState(false)
  const [noDevice, setNoDevice] = useState(false)
  // const [receivingVideo, setReceivingVideo] = useState(false)
  const [jmuxer, setJmuxer] = useState<JMuxer | null>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mainElem = useRef<HTMLDivElement>(null)
  const config = {
    fps: settings.fps,
    width: settings.width,
    height: settings.height,
    mediaDelay: settings.mediaDelay
  }
  // const pathname = "/"
  console.log(pathname)

  const carplayWorker = useMemo(
    () =>
      new Worker(new URL('./worker/carplay.ts', import.meta.url), {
        type: 'module'
      }) as CarPlayWorker,
    []
  )

  const { processAudio, startRecording, stopRecording } = useCarplayAudio(carplayWorker)

  // subscribe to worker messages
  useEffect(() => {
    carplayWorker.onmessage = (ev) => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setPlugged(true)
          break
        case 'unplugged':
          setPlugged(false)
          break
        case 'video':
          // if document is hidden we dont need to feed frames
          if (!jmuxer || document.hidden) return
          if (!receivingVideo) setReceivingVideo(true)
          const { message: video } = ev.data
          jmuxer.feed({
            video: video.data,
            duration: 0
          })
          break
        case 'audio':
          const { message: audio } = ev.data
          processAudio(audio)
          break
        case 'media':
          //TODO: implement
          break
        case 'command':
          const {
            message: { value }
          } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
            case CommandMapping.requestHostUI:
              navigate('/settings')
          }
          break
        case 'failure':
          console.error(`Carplay initialization failed -- Reloading page in ${RETRY_DELAY_MS}ms`)
          setTimeout(() => {
            window.location.reload()
          }, RETRY_DELAY_MS)
          break
      }
    }
  }, [carplayWorker, jmuxer, processAudio, receivingVideo, startRecording, stopRecording])

  // video init
  useEffect(() => {
    const jmuxer = new JMuxer({
      node: 'video',
      mode: 'video',
      fps: config.fps,
      flushingTime: 0,
      debug: false
    })
    setJmuxer(jmuxer)
    return () => {
      jmuxer.destroy()
    }
  }, [])

  useEffect(() => {
    const element = mainElem?.current
    if(!element) return;
    const observer = new ResizeObserver(() => {
      console.log("size change")
      carplayWorker.postMessage({type: 'frame'})
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, []);

  const checkDevice = useCallback(
    async (request: boolean = false) => {
      const device = request ? await requestDevice() : await findDevice()
      if (device) {
        console.log('starting in check')
        setNoDevice(false)
        carplayWorker.postMessage({ type: 'start', payload: config })
      } else {
        setNoDevice(true)
      }
    },
    [carplayWorker]
  )

  // usb connect/disconnect handling and device check
  useEffect(() => {
    navigator.usb.onconnect = async () => {
      checkDevice()
    }

    navigator.usb.ondisconnect = async () => {
      const device = await findDevice()
      if (!device) {
        carplayWorker.postMessage({ type: 'stop' })
        setNoDevice(true)
      }
    }

    //checkDevice()
  }, [carplayWorker, checkDevice])

  // const onClick = useCallback(() => {
  //   checkDevice(true)
  // }, [checkDevice])

  const sendTouchEvent = useCarplayTouch(carplayWorker, width, height)

  const isLoading = !noDevice && !receivingVideo

  return (
    <div
      style={pathname === '/' ? { height: '100%', touchAction: 'none' } : { display: 'none' }}
      id={'main'}
      className="App"
      ref={mainElem}
    >
      {(noDevice || isLoading) && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {noDevice && (
            <button rel="noopener noreferrer">
              Plug-In Carplay Dongle and Press
            </button>
          )}
          {isLoading && (
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              visible={true}
            />
          )}
        </div>
      )}
      <div
        id="videoContainer"
        onPointerDown={sendTouchEvent}
        onPointerMove={sendTouchEvent}
        onPointerUp={sendTouchEvent}
        onPointerCancel={sendTouchEvent}
        onPointerOut={sendTouchEvent}
        style={{
          height: '100%',
          width: '100%',
          padding: 0,
          margin: 0,
          display: 'flex'
        }}
      >
        <video id="video" style={isPlugged ? { height: '100%' } : undefined} autoPlay muted />
      </div>
    </div>
  )
}

export default React.memo(Carplay)
