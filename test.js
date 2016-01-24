'use strict';

/*global describe:false, it:false*/

const promisifyEvent = require('./index.js')();
const EventEmitter = require('events').EventEmitter;
const assert = require('assert');

function simpleEventEmitter() {
	const ev = new EventEmitter();
	setTimeout(() => {
		ev.emit('end', 'value');
	}, 10);
	return ev;
}

function dataEventEmitter() {
	const ev = new EventEmitter();
	setTimeout(() => { ev.emit('data', 0); }, 0);
	setTimeout(() => { ev.emit('data', 1); }, 10);
	setTimeout(() => { ev.emit('data', 2); }, 20);
	setTimeout(() => { ev.emit('data', 3); }, 30);
	setTimeout(() => { ev.emit('data', 4); }, 40);
	setTimeout(() => { ev.emit('end', 'done'); }, 50);
	return ev;
}

function errorEmitter() {
	const ev = new EventEmitter();
	setTimeout(() => { ev.emit('error', new Error()); }, 10);
	return ev;
}

function errorEmitterCustom() {
	const ev = new EventEmitter();
	setTimeout(() => { ev.emit('error2', {boop: true}); }, 10);
	return ev;
}

describe('export', () => {
	it('Correctly makes the function use the given promise implementation', () => {
		const MyPromiseImp = class MyPromiseImp extends Promise {
		};
		const otherPromisifyEvent = require('./index.js')(MyPromiseImp);
		assert(
			otherPromisifyEvent(simpleEventEmitter(), 'end') instanceof MyPromiseImp,
			'Wrong promise implemetation'
		);
	});

	it('Defaults to the native promise implementation', () => {
		assert(
			promisifyEvent(simpleEventEmitter(), 'end') instanceof Promise,
			'Wrong promise implementation'
		);
	});
});


describe('promisifyEvent', () => {
	it('Functions with the second argument being a string', () =>
		promisifyEvent(simpleEventEmitter(), 'end')
		.then(value => assert.equal(value, 'value'))
	);

	it('Functions with the second argument being an object', () =>
		promisifyEvent(simpleEventEmitter(), {name: 'end'})
	);

	it('Aggregates data when aggregate is set', () =>
		promisifyEvent(dataEventEmitter(), {
			name: 'end',
			aggregate: 'data'
		})
		.then(result => {
			assert.equal(result.value, 'done');
			assert.deepEqual(result.aggregated, [0, 1, 2, 3, 4]);
		})
	);

	it('Only resolves when the filter is set', () =>
		promisifyEvent(dataEventEmitter(), {
			name: 'data',
			filter: data => data === 4
		})
		.then(result => {
			assert.equal(result, 4);
		})
	);

	it('Rejects when error is emitted', () =>
		promisifyEvent(errorEmitter(), {name: 'end'})
		.then(
			() => assert(false, 'Should not resolve'),
			error => assert(error instanceof Error, 'Should be instanceof error')
		)
	);

	it('Rejects when the custom error is emitted', () =>
		promisifyEvent(dataEventEmitter(), {
			name: 'end',
			errorName: 'data'
		})
		.then(
			() => assert(false, 'Should not resolve'),
			() => { /* do nothing */ }
		)
	);

	it('Wraps a error string into an error object with the string being the message', () =>
		promisifyEvent(dataEventEmitter(), {
			errorName: 'end'
		})
		.then(
			() => assert(false, 'Should not resolve'),
			error => assert(error.message === 'done', 'Message should be emitted value')
		)
	);

	it('Wraps a non error and non string error object into an error object and adds the event as a property', () =>
		promisifyEvent(errorEmitterCustom(), {
			name: 'end',
			errorName: 'error2'
		})
		.then(
			() => assert(false, 'Should not resolve'),
			error => assert(error.event.boop, 'Object should be there')
		)
	);
});
