'use strict';


var noop = require('./lib/noop'),
	plugins = require('./lib/plugins');



module.exports = function (src, dest, options) {

	return function (req, res, next) {
		var chain = noop;

		Object.keys(options || {}).forEach(function (name) {
		    // Skip if explicitly set to false
		    if (options[name] === false) {
		        return;
		    }

		    var handler = plugins[name](src, dest, options[name]);

		    // Create a middleware chain of each handler
		    chain = (function (prev) {
		        return function devCompiler(req, res, next) {
		            handler(req, res, function (err) {
		                if (err) {
		                    next(err);
		                    return;
		                }
		                prev(req, res, next);
		            });
		        };
		    }(chain));
		});

		chain(req, res, next);
	};
};
