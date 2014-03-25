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


var middleware = require('../middleware'),
    requireAny = require('../requireany');


module.exports = function (srcRoot, destRoot, options) {
    var lib = requireAny('less');

    function less(data, args, callback) {
        var parser = new(lib.Parser)({
            paths: args.paths, // Specify search paths for @import directives
            filename: args.context.name, // Specify a filename, for better error messages
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
    }

    return middleware(srcRoot, destRoot, options, less);
};
