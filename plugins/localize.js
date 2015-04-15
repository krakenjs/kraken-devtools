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
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    localizr = require('localizr'),
    concat = require('concat-stream');


module.exports.localize = function localize(srcFile, propFile, cb) {
    var opt = {
        src: srcFile,
        props: propFile
    };

    var out = concat({ encoding: 'string'}, function (data) {
        cb(null, data);
    });

    var readStream = localizr.createReadStream(opt);
    var writeStream = readStream.pipe(out);
    readStream.on('error', cb);
    writeStream.on('error', cb);
};


module.exports.preHook = function pre(config, callback) {

    var locale = config.name.match(/(?:([A-Za-z0-9]{2})\/([A-Za-z]{2})\/)?(.*)/),
        copyFile,
        dir,
        srcFile,
        destFile;

    if (locale && locale[1] && locale[2]) {
        config.locality = {
            country: locale[1],
            language: locale[2]
        };
    }

    if (locale[3]) {
        dir = config.filePath.replace(path.extname(config.filePath), '');
        dir = dir.replace(config.name, '').replace(path.sep, '', 'g');
        copyFile = path.join( dir, locale[3]);
        config.origName = locale[3];
    }
    srcFile = path.join(config.srcRoot, copyFile + '.dust');

    // create an artificial srcRoot
    config.srcRoot = path.join(process.cwd() , 'tmp');
    destFile = path.join (config.srcRoot, 'templates', config.name + '.dust');

    //check if the srcFile exists
    fs.exists(srcFile, function (exists) {
        var err;
        if (!exists) {
            err = new Error('File not found:', srcFile);
            err.code = 'ENOENT';
            callback(err);
            return;
        } else {
            mkdirp(path.dirname(destFile), function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                fs.createReadStream(srcFile)
                    .pipe(fs.createWriteStream(destFile)
                        .on('finish', function() {
                            callback(null, config);
                        })
                        .on('error', callback));

            });
        }
    });

};


module.exports.postHook = function post(config, callback) {
    rimraf(config.srcRoot, function(err) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, config);
    });
};
