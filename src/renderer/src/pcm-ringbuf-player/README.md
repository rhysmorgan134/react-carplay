# pcm-ringbuf-player

A simple library that allows playing PCM Audio in the browser leveraging a ring buffer for efficient transport of data between the main thread and the audio thread.

## To Do

- [ ] Tests
- [ ] Support Other TypedArrays
- [ ] Documentation
- [x] Support 16 bit signed integer arrays

## Contributing

Happy for contributions - simply open a PR.

## Compatibility

This library uses `SharedArrayBuffer` under the hood, to enable it in the browser, the server serving the page needs to set the following headers

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

For more information and browser compatibiltiy see this [Mozilla developer doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) 
