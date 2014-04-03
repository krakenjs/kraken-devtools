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


var noop = require('./lib/noop'),
    middleware = require('./lib/middleware');


module.exports = function (src, dest, config) {


    // Dev compiler middleware
    return function (req, res, next) {
        var chain = noop;

        Object.keys(config || {}).forEach(function (name) {
            var options, compiler, handler;

            options = config[name];

            // Skip if explicitly set to false
            if (options === false || !options.module) {
                return;
            }

            compiler = require(options.module)(options);
            handler = middleware(src, dest, options, compiler);

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
