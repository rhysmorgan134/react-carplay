import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { RotatingLines } from 'react-loader-spinner'
import {
  findDevice,
  requestDevice,
  CommandMapping,
} from 'node-carplay/web'
import { CarPlayWorker } from './worker/types'
import useCarplayAudio from './useCarplayAudio'
import { useCarplayTouch } from './useCarplayTouch'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExtraConfig } from '../../../main/Globals'
import { useCarplayStore, useStatusStore } from '../store/store'
import { InitEvent } from './worker/render/RenderEvents'
import { Typography } from '@mui/material'

const videoChannel = new MessageChannel()
const micChannel = new MessageChannel()

interface CarplayProps {
  receivingVideo: boolean
  setReceivingVideo: (receivingVideo: boolean) => void
  settings: ExtraConfig
  command: string
  commandCounter: number
}

const Carplay: React.FC<CarplayProps> = ({
  receivingVideo,
  setReceivingVideo,
  settings,
  command,
  commandCounter,
}) => {
  const [isPlugged, setPlugged] = useStatusStore(state => [state.isPlugged, state.setPlugged])
  const [deviceFound, setDeviceFound] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)
  const mainElem = useRef<HTMLDivElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stream = useCarplayStore(state => state.stream)

  // Initial config
  const config = useRef({
    fps: settings.fps,
    width: window.innerWidth,
    height: window.innerHeight,
    mediaDelay: settings.mediaDelay,
  }).current

  // Setup render worker
  const renderWorker = useMemo(() => {
    if (!canvasElement) return
    const worker = new Worker(
      new URL('./worker/render/Render.worker.ts', import.meta.url),
      { type: 'module' },
    )
    const offscreen = canvasElement.transferControlToOffscreen()
    worker.postMessage(new InitEvent(offscreen, videoChannel.port2), [offscreen, videoChannel.port2])
    return worker
  }, [canvasElement])

  useLayoutEffect(() => {
    if (canvasRef.current) setCanvasElement(canvasRef.current)
  }, [])

  // Setup CarPlay worker
  const carplayWorker = useMemo(() => {
    const worker = new Worker(
      new URL('./worker/CarPlay.worker.ts', import.meta.url),
      { type: 'module' },
    ) as CarPlayWorker
    const payload = { videoPort: videoChannel.port1, microphonePort: micChannel.port1 }
    worker.postMessage({ type: 'initialise', payload }, [videoChannel.port1, micChannel.port1])
    return worker
  }, [])

  // Audio handling
  const { processAudio, getAudioPlayer, startRecording, stopRecording } =
    useCarplayAudio(carplayWorker, micChannel.port2)

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // Worker message handling
  useEffect(() => {
    carplayWorker.onmessage = ev => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setPlugged(true)
          if (settings.piMost && settings.most?.stream) stream(settings.most.stream)
          break
        case 'unplugged':
          setPlugged(false)
          break
        case 'requestBuffer':
          clearRetryTimeout()
          getAudioPlayer(ev.data.message)
          break
        case 'audio':
          clearRetryTimeout()
          processAudio(ev.data.message)
          break
        case 'media':
          // TODO: implement
          break
        case 'command':
          const { message: { value } } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
            case CommandMapping.requestHostUI:
              navigate('/settings')
              break
          }
          break
        case 'failure':
          if (!retryTimeoutRef.current) {
            console.error(`Carplay init failed, retry in ${RETRY_DELAY_MS}ms`)
            retryTimeoutRef.current = setTimeout(() => window.location.reload(), RETRY_DELAY_MS)
          }
          break
      }
    }
  }, [carplayWorker, clearRetryTimeout, getAudioPlayer, processAudio, startRecording, stopRecording, settings, stream, navigate])

  // Resize observer to trigger new frames
  useEffect(() => {
    const elem = mainElem.current
    if (!elem) return
    const obs = new ResizeObserver(() => carplayWorker.postMessage({ type: 'frame' }))
    obs.observe(elem)
    return () => obs.disconnect()
  }, [carplayWorker])

  // Send key commands
  useEffect(() => {
    carplayWorker.postMessage({ type: 'keyCommand', command })
  }, [commandCounter])


  useEffect(() => {
  // Handler for USB
  const onUsbConnect = async () => {
    const device = await findDevice();
    if (device) {
      setDeviceFound(true);
      setReceivingVideo(true);
      carplayWorker.postMessage({ type: 'start', payload: { config } });
    }
  };

  // Handler for USB disconnect
  const onUsbDisconnect = async () => {
    const device = await findDevice();
    if (!device) {
      carplayWorker.postMessage({ type: 'stop' });
      setDeviceFound(false);
      setReceivingVideo(false);
      setPlugged(false)
    }
  };

  navigator.usb.addEventListener('connect', onUsbConnect);
  navigator.usb.addEventListener('disconnect', onUsbDisconnect);

  onUsbConnect();

  return () => {
    navigator.usb.removeEventListener('connect', onUsbConnect);
    navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
  };
  }, [carplayWorker, setReceivingVideo, config]);

  // Touch handling
  const sendTouchEvent = useCarplayTouch(carplayWorker)

  const isLoading = !isPlugged

  return (
    <div
      id="main"
      ref={mainElem}
      className="App"
      style={
        pathname === '/'
          ? { height: '100%', width: '100%', touchAction: 'none' }
          : { display: 'none' }
      }
    >
      {(!deviceFound || isLoading) && pathname === '/' && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
	    flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {!deviceFound ? (
            <>
              <Typography>Searching For Dongle</Typography>
              <RotatingLines strokeColor="grey" strokeWidth={5} animationDuration={0.75} width={96} visible />
            </>
          ) : (
            <>
              <Typography>Searching For Phone</Typography>
              <RotatingLines strokeColor="grey" strokeWidth={5} animationDuration={0.75} width={96} visible />
            </>
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
        style={{ height: '100%', width: '100%', padding: 0, margin: 0, display: 'flex', visibility: isPlugged ? 'visible' : 'hidden' }}
      >
        <canvas
          ref={canvasRef}
          id="video"
          style={isPlugged ? { width: '100%', height: '100%' } : { width: 0, height: 0 }}
        />
      </div>
    </div>
  )
}

export default React.memo(Carplay)
