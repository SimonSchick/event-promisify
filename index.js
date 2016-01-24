'use strict';

/**
 * @typedef {Object} PromisifyOptions
 * @property {string} name Name of the event.
 * @property {!boolean function(data: *)} filter [description]
 * @property {boolean} aggregate If set, it will aggregate the data from the specified event.
 * @property {string} errorName The event to be used to abort/reject the promise in addition to error.
 * @property {boolean} [ignoreErrors=false] Should the default error handler be ignored.
 */

/**
 * @typedef {Object} PromisifyResult
 * @property {*} value The value from the final event emitted.
 * @property {*[]} aggregated The aggregated data.
 */

/**
 * Wraps an EventEmitter for promise support.
 * Once the expected event is called, the promise will be resolved with the emitted value.
 * If the error event is emitted before that, the promise will be rejected with the given error.
 * @param  {EventEmitter} obj The emitter to bind on
 * @param  {string|PromisifyOptions} name The event name or an advanced options object.
 * @return {Promise<*|PromisifyResult>} Promise
 */
const nativePromise = Promise;
module.exports = Promise => function promisifyEvent(obj, nameOrOptions) {
	Promise = Promise || nativePromise;
	const filter = nameOrOptions.filter || false;
	const aggregateEventName = nameOrOptions.aggregate;
	const eventName = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name;
	const errorEvent = nameOrOptions.errorName;
	const ignoreErrors = nameOrOptions.ignoreErrors;
	let aggregated;
	let aggregateEventHandle;
	if (aggregateEventName) {
		aggregated = [];
		aggregateEventHandle = data => {
			aggregated.push(data);
		};
		obj.on(aggregateEventName, aggregateEventHandle);
	}
	return new Promise((resolve, reject) => {
		const succHandler = data => {
			if (filter && !filter(data)) {
				return;
			}
			obj.removeListener('error', errorHandler);
			if (aggregateEventName) {
				obj.removeListener(aggregateEventName, aggregateEventHandle);
				return resolve({
					value: data,
					aggregated: aggregated
				});
			}
			return resolve(data);
		};
		const errorHandler = error => {
			if (!(error instanceof Error)) {
				if (typeof error === 'string') {
					error = new Error(error);
				} else {
					const tempError = new Error('Error event emitted, event contained in .event');
					tempError.event = error;
					error = tempError;
				}
			}
			if (aggregateEventName) {
				obj.removeListener(aggregateEventName, aggregateEventHandle);
			}
			obj.removeListener(eventName, succHandler);
			obj.removeListener('error', errorHandler);
			if (errorEvent) {
				obj.removeListener(errorEvent, errorHandler);
			}
			reject(error);
		};
		if (filter) {
			obj.on(eventName, succHandler);
		} else {
			obj.once(eventName, succHandler);
		}

		obj.once('error', error => {
			if (ignoreErrors) {
				return;
			}
			errorHandler(error);
		});
		if (errorEvent) {
			obj.once(errorEvent, errorHandler);
		}
	});
};
