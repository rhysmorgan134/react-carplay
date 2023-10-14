type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

type TypedArrayConstructor<T> = {
  new (buffer: ArrayBuffer, byteOffset?: number, length?: number): T
  BYTES_PER_ELEMENT: number
}

declare module 'ringbuf.js' {
  export class RingBuffer<T extends TypedArray> {
    constructor(sab: SharedArrayBuffer, type: TypedArrayConstructor<T>)
    push(elements: T, length?: number, offset = 0): number
    pop(elements: TypedArray, length: number, offset = 0): number
    empty(): boolean
    full(): boolean
    capacity(): number
    availableRead(): number
  }
}
