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
    express = require('express'),
    rimraf = require('rimraf'),
    devtools = require('../../'),
    srcRoot = path.join(__dirname, '../fixtures/public'),
    destRoot = path.join(__dirname, '../tmp');


module.exports.createApp = function createApp(config) {
    config = config || {};

    var app = express();

    app.use(devtools(srcRoot, destRoot, config));
    app.use(express.static(destRoot));

    app.get('/', function (req, res) {
        res.sendStatus(200);
    });

    return app;
};


module.exports.cleanUp = function cleanUp() {
    rimraf(destRoot, function (err) {
        if (err) {
            // don't throw
        }
    });
};
