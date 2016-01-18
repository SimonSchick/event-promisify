# event-promisify

[![NPM](https://nodei.co/npm/event-promisify.png)](https://nodei.co/npm/event-promisify/)

[![Build Status](https://travis-ci.org/SimonSchick/event-promisify.svg?branch=master)](https://travis-ci.org/SimonSchick/event-promisify)
[![Dependencies](https://david-dm.org/SimonSchick/event-promisify.svg)](https://david-dm.org/SimonSchick/event-promisify)
[![npm version](http://img.shields.io/npm/v/event-promisify.svg)](https://npmjs.org/package/event-promisify)

Just run ```npm install event-promisify```

# documentation

This implementation supports basic promisification, event filtering, aggregation, custom specification
of error events and is promise library agnostic (defaults to native/global Promise object).

## Examples

```javascript
const promisifyEvent = require('event-promisify')(YOUR_PROMISE_IMPLEMENTATION_HERE);

promisifyEvent(someEventEmitter, 'someEvent')
.then(...)
```

For now check test.js and the source for further information.
