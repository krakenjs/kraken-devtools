'use strict';


var assert = require('assert'),
    noop = require('./noop'),
    requireAny = require('./requireany'),
    middleware = require('./middleware'),
    path = require('path');


exports.dust = function (srcRoot, destRoot, options, intl) {
    var lib, compiler, i18n;
    lib = requireAny('dustjs-linkedin', 'adaro');
    i18n = (intl) ? require('./localize'): undefined;

    compiler = function dust(name, data, args, callback) {
        var srcFile, propFile;
        try {
            //if there is i18n, need to first run through localizr
            if (i18n) {
                srcFile = args.context.filePath;
                srcFile = srcFile.replace(path.extname(srcFile), '.dust');
                srcFile = path.join(args.context.srcRoot, srcFile);
                propFile = path.join(intl.contentPath, name + '.properties');

                i18n.localize(srcFile, propFile, function(err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, lib.compile(data, name));
                });

            } else {
                callback(null, lib.compile(data.toString('utf8'), name));
            }

        } catch (err) {
            callback(err);
        }
    };

    return middleware(srcRoot, destRoot, options, compiler, 'js');
};



exports.less = function (srcRoot, destRoot, options) {
    var lib, compiler;

    lib = requireAny('less');
    compiler = function less(name, data, args, callback) {
        var parser = new(lib.Parser)({
            paths: args.paths, // Specify search paths for @import directives
            filename: name, // Specify a filename, for better error messages
            dumpLineNumbers: "comments" // Enables comment style debugging
        });

        try {

            // Really? REALLY?! It takes an error-handling callback but still can throw errors?
            parser.parse(data.toString('utf8'), function (err, tree) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, tree.toCSS());
            });

        } catch (err) {
            callback(err);
        }
    };

    return middleware(srcRoot, destRoot, options, compiler, 'css');
};



exports.sass = function (srcRoot, destRoot, options) {
    var lib, compiler;

    lib = requireAny('node-sass');
    compiler = function scss(name, data, args, callback) {
        lib.render({
            data: data,
            success: callback.bind(this, null),
            error: callback,
            includePaths: args.paths
        });
    };

    return middleware(srcRoot, destRoot, options, compiler, 'css');
};



exports.default = function (srcRoot, destRoot, options) {
    var compiler;

    compiler = function (name, data, args, callback) {
        // noop
        callback(null, data);
    };

    return middleware(srcRoot, destRoot, options, compiler, '[a-zA-Z]{2,5}?');
};
