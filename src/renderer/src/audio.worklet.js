"use strict";
// WebAudio's render quantum size.
const RENDER_QUANTUM_FRAMES = 128;
const RING_POINTERS_SIZE = 8;
/**
 * A Reader class used by this worklet to read from a Adapted from a SharedArrayBuffer written to by ringbuf.js on the main thread, Adapted from https://github.com/padenot/ringbuf.js
 * MPL-2.0 License (see RingBuffer_LICENSE.txt)
 *
 * @author padenot
 */
class RingBuffReader {
    constructor(buffer) {
        const storageSize = (buffer.byteLength - RING_POINTERS_SIZE) / Int16Array.BYTES_PER_ELEMENT;
        this.storage = new Int16Array(buffer, RING_POINTERS_SIZE, storageSize);
        // matching capacity and R/W pointers defined in ringbuf.js
        this.writePointer = new Uint32Array(buffer, 0, 1);
        this.readPointer = new Uint32Array(buffer, 4, 1);
    }
    readTo(array) {
        const { readPos, available } = this.getReadInfo();
        if (available === 0) {
            return 0;
        }
        const readLength = Math.min(available, array.length);
        const first = Math.min(this.storage.length - readPos, readLength);
        const second = readLength - first;
        this.copy(this.storage, readPos, array, 0, first);
        this.copy(this.storage, 0, array, first, second);
        Atomics.store(this.readPointer, 0, (readPos + readLength) % this.storage.length);
        return readLength;
    }
    getReadInfo() {
        const readPos = Atomics.load(this.readPointer, 0);
        const writePos = Atomics.load(this.writePointer, 0);
        const available = (writePos + this.storage.length - readPos) % this.storage.length;
        return {
            readPos,
            writePos,
            available,
        };
    }
    copy(input, offset_input, output, offset_output, size) {
        for (let i = 0; i < size; i++) {
            output[offset_output + i] = input[offset_input + i];
        }
    }
}
class PCMWorkletProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.underflowing = false;
        const { sab, channels } = options.processorOptions;
        this.channels = channels;
        this.reader = new RingBuffReader(sab);
        this.readerOutput = new Int16Array(RENDER_QUANTUM_FRAMES * channels);
    }
    toFloat32(value) {
        return value / 32768;
    }
    process(_, outputs) {
        const outputChannels = outputs[0];
        const { available } = this.reader.getReadInfo();
        if (available < this.readerOutput.length) {
            if (!this.underflowing) {
                console.debug('UNDERFLOW', available);
            }
            this.underflowing = true;
            return true;
        }
        this.reader.readTo(this.readerOutput);
        for (let i = 0; i < this.readerOutput.length; i++) {
            // split interleaved audio as it comes from the dongle by splitting it across the channels
            if (this.channels === 2) {
                for (let channel = 0; channel < this.channels; channel++) {
                    outputChannels[channel][i] = this.toFloat32(this.readerOutput[2 * i + channel]);
                }
            }
            else {
                outputChannels[0][i] = this.toFloat32(this.readerOutput[i]);
            }
        }
        this.underflowing = false;
        return true;
    }
}
registerProcessor('pcm-worklet-processor', PCMWorkletProcessor);
//# sourceMappingURL=audio.worklet.js.map