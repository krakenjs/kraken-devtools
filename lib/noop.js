'use strict';


module.exports = function noop() {
    var args = Array.prototype.slice.call(arguments);
    var callback;
    if (typeof args[args.length - 1] === 'function') {
        callback = args.pop();
        args.unshift(null);
        callback.apply(undefined, args);
    }
};