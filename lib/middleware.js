/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 eBay Software Foundation                                │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/
'use strict';


var fs = require('fs'),
    path = require('path'),
	async = require('async'),
    mkdirp = require('mkdirp'),
	noop = require('./noop'),
	filter = require('./filter');


module.exports = function middleware(srcRoot, destRoot, options, compiler) {

    return filter(options.files, function (req, res, next) {

        var tasks = [
            options.precompile || noop,
            createExecutor(compiler),
            options.postcompile || noop
        ];

        var start = function (callback) {
            var context, regex, dir, ext;

            // Match the base name of the file to pass to compilers
            dir = options.base || '';
            ext = path.extname(req.path).replace('.', '\\.');
            regex = new RegExp(dir + '/(.*)' + ext +'$', 'i');

            // The compile context is passed through all compile steps
            context = {
                srcRoot:  srcRoot,
                destRoot: destRoot,
                filePath: req.path.replace('/', path.sep),
                name: regex.exec(req.path)[1],
                ext: options.ext
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

    if (context.ext) {
        // XXX: compiler.name is source file extension, so if there's no name we don't concern ourselves
        // with looking for a source file that's different from the dest file.
        srcFile = srcFile.replace(path.extname(srcFile), '') + '.' + context.ext;
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

        compiler(raw, { paths: dirs, context: context }, function (err, result) {
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
