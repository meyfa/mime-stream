'use strict'

const stream = require('stream')

const fileType = require('file-type')

/**
 * Duplex (Transform) stream that emits a 'type' event as soon as the input's
 * MIME type is known.
 *
 * The data itself is pushed through as-is.
 *
 * The event consists of an object with the following properties:
 * - ext: the extension (e.g. 'png')
 * - mime: the mime type (e.g. 'image/png')
 *
 * When the type is unknown or could not be detected (stream closed too early),
 * null is given instead of the event object.
 */
class MimeStream extends stream.Transform {
  /**
   * Constructor. Optionally a listener can be attached directly (but more can
   * always be added).
   *
   * @param {Function} listener Listener to attach immediately.
   */
  constructor (listener) {
    super()

    this._type = null

    this._chunkBuffer = {
      chunks: [],
      length: 0
    }
    this._typeEmitted = false

    // bind listener
    if (typeof listener === 'function') {
      this.on('type', listener)
    }
  }

  /**
   * The detected type, or null if unknown / still waiting for more data.
   *
   * @type {String|null}
   */
  get type () {
    return this._type ? {
      ext: this._type.ext,
      mime: this._type.mime
    } : null
  }

  /**
   * @override
   */
  _transform (chunk, encoding, cb) {
    // do not emit twice
    if (this._typeEmitted) {
      return cb(null, chunk)
    }

    this._chunkBuffer.chunks.push(chunk)
    this._chunkBuffer.length += chunk.length

    // try to detect
    const detection = fileType(Buffer.concat(this._chunkBuffer.chunks))

    // if type known or limit exceeded, emit
    // (file-type guarantees that it needs at most 'minimumBytes' bytes)
    if (detection || this._chunkBuffer.length >= fileType.minimumBytes) {
      this._type = detection
      this.emit('type', this.type)
      this._typeEmitted = true
    }

    cb(null, chunk)
  }

  /**
   * @override
   */
  _flush (cb) {
    // emit null if there was no detection at all
    if (!this._typeEmitted) {
      this._type = null
      this.emit('type', this.type)
      this._typeEmitted = true
    }

    cb()
  }
}

module.exports = MimeStream
