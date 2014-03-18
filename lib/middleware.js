'use strict';


var fs = require('fs'),
    path = require('path'),
	async = require('async'),
    mkdirp = require('mkdirp'),
	noop = require('./noop'),
	filter = require('./filter');


module.exports = function middleware(srcRoot, destRoot, options, compiler, ext) {

    // API allows just a string or config object
    options = options || '';
    if (typeof options === 'string') {
        options = { dir: options };
    }

    var regex = createPathRegex(options.dir || '', ext);
    var tasks = [
        options.precompile || noop,
        createExecutor(compiler),
        options.postcompile || noop
    ];

    return filter(regex, function (req, res, next) {

        var start = function (callback) {
            // Create the compile context. This gets passed through all compile steps.
            var context = {
                srcRoot:  srcRoot,
                destRoot: destRoot,
                filePath: req.path.replace('/', path.sep),
                name:     req.path.match(regex)[1]
            };

            callback(null, context);
        };

        async.waterfall([start].concat(tasks), function (err) {
            // Guard against modules throwing whatever they damn well please.

            if (typeof err === 'string') {
                err = new Error(err);
            }

            // On Ubuntu, `less` failures return an object that is not an error but has the structure
            // { type: '', message: '', index: '' } so we need to accommodate that. :/
            if (typeof err === 'object' && err !== null && !(err instanceof Error)) {
                err = Object.keys(err).reduce(function (dest, prop) {
                    dest[prop] = err[prop];
                    return dest;
                }, new Error());
            }

            // Missing source is a valid case. Not an error.
            if (err && err.code === 'ENOENT') {
                err = undefined;
            }

            next(err);
        });

    });

};


function createPathRegex(dir, ext) {
    dir = dir || '';
    if (dir.charAt(0) !== '/') {
        dir = '/' + dir;
    }

    if (dir.charAt(dir.length - 1) !== '/') {
        dir = dir + '/';
    }

    return new RegExp('^' + dir + '(.*)\\.' + ext +'$', 'i');
}


function createExecutor(compiler) {
    return function compile(context, callback) {
        exec(compiler, context, function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, context);
        });
    };
}


function exec(compiler, context, callback) {
    var srcFile, destFile, srcPath, destPath;

    srcFile = destFile = context.filePath;
    if (compiler.name) {
        // XXX: compiler.name is source file extension, so if there's no name we don't concern ourselves
        // with looking for a source file that's different from the dest file.
        srcFile = srcFile.replace(path.extname(srcFile), '') + '.' + compiler.name;
    }

    srcPath  = path.join(context.srcRoot, srcFile);
    destPath = path.join(context.destRoot, destFile);

    fs.readFile(srcPath, function (err, raw) {
        var dirs, dir;

        if (err) {
            callback(err);
            return;
        }

        // Build search paths for compilers.
        dirs = [];
        dir = path.dirname(srcPath);
        while (dir !== context.srcRoot) {
            dirs.unshift(dir);
            dir = path.dirname(dir);
        }

        compiler(context.name, raw, { paths: dirs, context: context }, function (err, result) {
            if (err) {
                callback(err);
                return;
            }

            mkdirp(path.dirname(destPath), function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                fs.writeFile(destPath, result, callback);
            });
        });
    });
}
