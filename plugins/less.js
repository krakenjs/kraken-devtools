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


var lib = require('less');


module.exports = function (options) {

    options.ext = options.ext || 'less';

    return function (data, args, callback) {
        var options = {
            paths: args.paths,
            filename: args.context.name,
            dumpLineNumbers: 'comments'
        };

        try {
            // Really? REALLY?! It takes an error-handling callback but still can throw errors?
            lib.render(data.toString('utf8'), options)
              .then(function(tree) {
                callback(null, tree.css);
              }, function(err) {
                callback(err);
              });

        } catch (err) {
            callback(err);
        }
    };

};
