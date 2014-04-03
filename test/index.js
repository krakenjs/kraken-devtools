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
/*global describe, it, beforeEach, afterEach*/

'use strict';


var request = require('supertest'),
    testutil = require('./util');


describe('devtools', function () {


    afterEach(function () {
        testutil.cleanUp();
    });


    it('returns a middleware chain using an empty config', function (done) {
        var app = testutil.createApp();

        request(app)
            .get('/')
            .expect(200)
            .end(done);
    });


    it('returns a middleware chain using a non-empty config', function (done) {
        var app = testutil.createApp({
            less: {
                module: './plugins/less',
                files: '/css/**/*.css'
            }
        });

        request(app)
            .get('/')
            .expect(200)
            .end(done);
    });


});