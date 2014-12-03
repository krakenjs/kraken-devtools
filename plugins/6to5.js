'use strict';

var to5 = require('6to5');

module.exports = function (options) {

	options.ext = options.ext || 'js';

	return function (data, args, callback) {

		var options = args.options,
			error = null,
			transformed;

		try {
			transformed = to5.transform(data.toString('utf8'), options);
		} catch(e) {
			error = e;
		}

		callback(error, transformed && transformed.code);

	};
};