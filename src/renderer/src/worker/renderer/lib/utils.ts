// Based on https://github.com/codewithpassion/foxglove-studio-h264-extension/tree/main
// MIT License
import { Bitstream, NALUStream, StreamType } from './h264-utils'

export type NaluStreamType = StreamType
export type NaluStreamInfo = { type: NaluStreamType; boxSize: number }

function identifyNaluStreamInfo(buffer: Uint8Array): NaluStreamInfo {
  let stream: NALUStream | undefined
  try {
    stream = new NALUStream(buffer, { strict: true, type: 'unknown' })
  } catch (err) {
    stream = undefined
  }
  if (stream?.type && stream?.boxSize != null) {
    return { type: stream.type, boxSize: stream.boxSize }
  }
  return { type: 'unknown', boxSize: -1 }
}

type GetNaluResult = {
  type: number
  nalu: { rawNalu: Uint8Array; nalu: Uint8Array }
}[]

function getNalus(buffer: Uint8Array): GetNaluResult {
  const stream = new NALUStream(buffer, { type: 'annexB' })
  const result: GetNaluResult = []

  for (const nalu of stream.nalus()) {
    if (nalu?.nalu) {
      const bitstream = new Bitstream(nalu?.nalu)
      bitstream.seek(3)
      const nal_unit_type = bitstream.u(5)
      if (nal_unit_type !== undefined) {
        result.push({ type: nal_unit_type, nalu })
      }
    }
  }

  return result
}

const NaluTypes = {
  NDR: 1,
  IDR: 5,
  SEI: 6,
  SPS: 7,
  PPS: 8,
  AUD: 9,
}

export { identifyNaluStreamInfo, getNalus, NaluTypes }
