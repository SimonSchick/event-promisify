'use strict';

/*global describe:false, it:false*/

const promisifyEvent = require('./index.js')();
const EventEmitter = require('events').EventEmitter;
const assert = require('assert');

function simpleEventEmitter() {
	const ev = new EventEmitter();
	setTimeout(() => {
		ev.emit('end', 'value');
	}, 100);
	return ev;
}

function dataEventEmitter() {
	const ev = new EventEmitter();
	setTimeout(() => { ev.emit('data', 0); }, 0);
	setTimeout(() => { ev.emit('data', 1); }, 100);
	setTimeout(() => { ev.emit('data', 2); }, 200);
	setTimeout(() => { ev.emit('data', 3); }, 300);
	setTimeout(() => { ev.emit('data', 4); }, 400);
	setTimeout(() => { ev.emit('end', 'done'); }, 500);
	return ev;
}

function errorEmitter() {
	const ev = new EventEmitter();
	setTimeout(() => { ev.emit('error', new Error()); }, 100);
	return ev;
}

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
			() => { /* do nothing */ }
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
});
