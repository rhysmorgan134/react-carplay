// Based on https://github.com/codewithpassion/foxglove-studio-h264-extension/tree/main
// MIT License
import { NALUStream, SPS } from './lib/h264-utils'
import {
  getNalus,
  identifyNaluStreamInfo,
  NaluStreamInfo,
  NaluTypes,
} from './lib/utils'
import { InitEvent, RenderEvent, WorkerEvent } from './RenderEvents'
import { WebGLRenderer } from './WebGLRenderer'

export interface FrameRenderer {
  draw(data: VideoFrame): void
}

// eslint-disable-next-line no-restricted-globals
const scope = self as unknown as Worker

type HostType = Window & typeof globalThis

export class RenderWorker {
  constructor(private host: HostType) {}

  private renderer: FrameRenderer | null = null
  private pendingFrame: VideoFrame | null = null
  private startTime: number | null = null
  private frameCount = 0
  private timestamp = 0
  private fps = 0

  private naluStreamInfo: NaluStreamInfo | null = null

  private onVideoDecoderOutput = (frame: VideoFrame) => {
    // Update statistics.
    if (this.startTime == null) {
      this.startTime = performance.now()
    } else {
      const elapsed = (performance.now() - this.startTime) / 1000
      this.fps = ++this.frameCount / elapsed
    }

    // Schedule the frame to be rendered.
    this.renderFrame(frame)
  }

  private renderFrame = (frame: VideoFrame) => {
    if (!this.pendingFrame) {
      // Schedule rendering in the next animation frame.
      requestAnimationFrame(this.renderAnimationFrame)
    } else {
      // Close the current pending frame before replacing it.
      this.pendingFrame.close()
    }
    // Set or replace the pending frame.
    this.pendingFrame = frame
  }

  private renderAnimationFrame = () => {
    if (this.pendingFrame) {
      this.renderer?.draw(this.pendingFrame)
      this.pendingFrame = null
    }
  }

  private onVideoDecoderOutputError = (err: Error) => {
    console.error(`H264 Render worker decoder error`, err)
  }

  private getNaluStreamInfo = (imgData: Uint8Array) => {
    if (this.naluStreamInfo === undefined) {
      const streamInfo = identifyNaluStreamInfo(imgData)
      if (streamInfo.type !== 'unknown') {
        this.naluStreamInfo = streamInfo
        console.debug(
          `Stream identified as ${streamInfo.type} with box size: ${streamInfo.boxSize}`,
        )
      }
    }
    return this.naluStreamInfo
  }

  private decoder = new VideoDecoder({
    output: this.onVideoDecoderOutput,
    error: this.onVideoDecoderOutputError,
  })

  private getAnnexBFrame(frameData: Uint8Array) {
    const streamInfo = this.getNaluStreamInfo(frameData)
    if (streamInfo?.type === 'packet') {
      const res = new NALUStream(frameData, {
        type: 'packet',
        boxSize: streamInfo.boxSize,
      }).convertToAnnexB().buf
      return res
    }
    return frameData
  }

  init = (event: InitEvent) => {
    this.renderer = new WebGLRenderer('webgl', event.canvas)
  }

  onFrame = (event: RenderEvent) => {
    const typedArray = new Uint8Array(event.frameData)
    // the decoder, as it is configured, expects 'annexB' style h264 data.
    const frame = this.getAnnexBFrame(typedArray)
    if (this.decoder.state === 'unconfigured') {
      const decoderConfig = this.getDecoderConfig(frame)
      if (decoderConfig) {
        this.decoder.configure(decoderConfig)
      }
    }
    if (this.decoder.state === 'configured') {
      const keyframe = this.isKeyFrame(typedArray) ? 'key' : 'delta'

      try {
        this.decoder.decode(
          new EncodedVideoChunk({
            type: keyframe,
            data: frame,
            timestamp: this.timestamp++,
          }),
        )
      } catch (e) {
        console.error(`H264 Render Worker decode error`, e)
      }
    }
  }

  private getDecoderConfig(frameData: Uint8Array): VideoDecoderConfig | null {
    const nalus = getNalus(frameData)
    const spsNalu = nalus.find(n => n.type === NaluTypes.SPS)
    if (spsNalu) {
      const sps = new SPS(spsNalu.nalu.nalu)
      const decoderConfig: VideoDecoderConfig = {
        codec: sps.MIME,
        codedHeight: sps.picHeight,
        codedWidth: sps.picWidth,
        hardwareAcceleration: 'prefer-hardware',
      }
      return decoderConfig
    }
    return null
  }

  private isKeyFrame(frameData: Uint8Array): boolean {
    const nalus = getNalus(frameData)
    return nalus.find(n => n.type === NaluTypes.IDR) !== undefined
  }
}

// eslint-disable-next-line no-restricted-globals
const worker = new RenderWorker(self)
scope.addEventListener('message', (event: MessageEvent<WorkerEvent>) => {
  if (event.data.type === 'init') {
    worker.init(event.data as InitEvent)
  } else if (event.data.type === 'frame') {
    worker.onFrame(event.data as RenderEvent)
  }
})

export {}
