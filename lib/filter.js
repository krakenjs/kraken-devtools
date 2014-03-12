'use strict';


module.exports = function filter(regex, callback) {
    return function filter(req, res, next) {

        if (req.method.toLowerCase() !== 'get') {
            next();
            return;
        }

        if (!req.path.match(regex)) {
            next();
            return;
        }

        callback.apply(undefined, arguments);
    };
};