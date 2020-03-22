# mime-stream

[![Build Status](https://travis-ci.com/meyfa/mime-stream.svg?branch=master)](https://travis-ci.com/meyfa/mime-stream)
[![Test Coverage](https://api.codeclimate.com/v1/badges/967ee21b11d6972d342a/test_coverage)](https://codeclimate.com/github/meyfa/mime-stream/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/967ee21b11d6972d342a/maintainability)](https://codeclimate.com/github/meyfa/mime-stream/maintainability)

Node pass-through stream for MIME type detection.

## Install

```
npm i mime-stream
```

## Usage

### Event: 'type'

This event is emitted as soon as the type is detected. If the type remains
unknown, `null` is passed to the event handler instead of an object.

It is guaranteed that there is always exactly one `type` event emitted, even
when the stream is closed prematurely.

Example:

```javascript
const fs = require('fs')
const MimeStream = require('mime-stream')

const stream = new MimeStream()
stream.on('type', function (type) {
  console.log(type) // { ext: 'png', mime: 'image/png' }
})

fs.createReadStream('myimage.png').pipe(stream)
```

You could also add more `.pipe()` calls to the chain. `MimeStream` is
non-destructive and passes on any data it receives.

### Listener Function

This is the same as binding a function to the `type` event, just more
concise.

Example:

```javascript
const fs = require('fs')
const MimeStream = require('mime-stream')

// `new` is optional anyway
fs.createReadStream('myimage.png').pipe(MimeStream((type) => {
  console.log(type) // { ext: 'png', mime: 'image/png' }
}))
```

### Property

After detection, the detection result is also available inside the `type`
property. Example:

```javascript
stream.on('end', function () {
  console.log(stream.type) // { ext: 'png', mime: 'image/png' }
})
```
