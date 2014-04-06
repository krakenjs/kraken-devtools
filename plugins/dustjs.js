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


var path = require('path'),
    requireAny = require('../lib/requireany'),
    i18n = require('./localize'),
    lib = requireAny('dustjs-linkedin', 'adaro');


module.exports = function (options) {

    options.ext = options.ext || 'dust';

    if (options.i18n) {
        options.precompile = i18n.preHook;
        options.postcompile = i18n.postHook;
    }

    return function (data, args, callback) {
        var srcFile, propFile;

        try {
            //if there is i18n, need to first run through localizr
            if (options.i18n) {
                srcFile = args.context.filePath;
                srcFile = srcFile.replace(path.extname(srcFile), '.' + options.ext);
                srcFile = path.join(args.context.srcRoot, srcFile);
                propFile = path.join(options.i18n.contentPath, args.context.name + '.properties');

                i18n.localize(srcFile, propFile, function(err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, lib.compile(data, args.context.origName || args.context.name));
                });

            } else {
                callback(null, lib.compile(data.toString('utf8'), args.context.name));
            }

        } catch (err) {
            callback(err);
        }
    };

};