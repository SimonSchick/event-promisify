# event-promisify

[![NPM](https://nodei.co/npm/event-promisify.png)](https://nodei.co/npm/event-promisify/)

[![Build Status](https://travis-ci.org/SimonSchick/event-promisify.svg?branch=master)](https://travis-ci.org/SimonSchick/event-promisify)
[![Dependencies](https://david-dm.org/SimonSchick/event-promisify.svg)](https://david-dm.org/SimonSchick/event-promisify)
[![npm version](http://img.shields.io/npm/v/event-promisify.svg)](https://npmjs.org/package/event-promisify)

Just run ```npm install event-promisify```

# Documentation

This implementation supports basic promisification, event filtering, aggregation, custom specification
of error events and is promise library agnostic (defaults to native/global Promise object).

## Errors
Keep in mind that some promise implementations do not take kindly to using non-errors for rejections.
Therefor when a(an) (custom) error event, the event value will be contained in an error object,
but only if the event is not an error already.
If the emitted object is a string however, the string will be used for the errors message, no event
property will be added!

## Multiple emitted values
Not supported, multiple emitted values is usually a sign of bad design.
If you happen to find a good reason why this should be supported, please create an issue.
Meanwhile this will suffice.
```javascript
function fixMultiArgEventEmitter(emitter, name, newName) {
	emitter.on(name, function() { emitter.emit(newName, Array.prototype.slice.call(arguments)));
}
```

## Examples

### Simple promisification

```javascript
const promisifyEvent = require('event-promisify')(YOUR_PROMISE_CONSTRUCTOR_HERE);

promisifyEvent(someEventEmitter, 'someEvent')
.then(...)
```

### Event filtering

```javascript
promisifyEvent(someEventEmitter, {
	name: 'someEventThatOccursmultipleTimes',
	filter: event => someConditionThatReturnsABooleanWhenYouAreDone(event)
})
.then(...)
```

### Event aggregation

```javascript
promisifyEvent(someEventEmitter, {
	name: 'end',
	aggregate: 'data'
})
.then(result => console.log( /* array of aggregated event data */ result.aggregated, /* final event data */ result.value))
```

### Custom termination event

```javascript
promisifyEvent(someEventEmitter, {
	name: 'end',
	errorName: 'disconnect'
})
.catch(error => ...)
```

### Ignore errors

Custom errors will still be handled.

It usually means you did something wrong if this happens, but some libraries may emit
intermediate errors when they actually should emit warnings or similar.

Be also warned that this MAY lead to promises not settling!

```javascript
promisifyEvent(someEventEmitter, {
	name: 'end',
	ignoreErrors: true
})
.then(...)
```

For now more info check test.js and the index.js for further information.
