'use strict';

var path = require('path');
var to5 = require('6to5');

module.exports = function (options) {

	options.ext = options.ext || 'js';

	return function (data, args, callback) {
		console.log(arguments);
	};
};