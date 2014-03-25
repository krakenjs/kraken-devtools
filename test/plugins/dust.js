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


var path = require('path'),
    request = require('supertest'),
    testutil = require('../util');


describe('plugins:dust', function () {

    afterEach(function () {
        testutil.cleanUp();
    });


    it('compiles dust to js', function (done) {
        var app = testutil.createApp({
            dust: {
                module: './lib/plugins/dust',
                files: '/templates/**/*.js',
                base: '/templates'
            }
        });

        request(app)
            .get('/templates/index.js')
            .expect(/dust.register\("index"/)
            .expect(200)
            .end(done);
    });


    it('compiles nested dust to js', function (done) {
        var app = testutil.createApp({
            dust: {
                module: './lib/plugins/dust',
                files: '/templates/**/*.js',
                base: '/templates'
            }
        });

        request(app)
            .get('/templates/inc/partial.js')
            .expect(/dust.register\("inc\/partial"/)
            .expect(200)
            .end(done);
    });


    it('compiles localized dust to js', function (done) {
        var app = testutil.createApp({
            dust: {
                module: './lib/plugins/dust',
                files: '/templates/**/*.js',
                base: '/templates',
                i18n: {
                    contentPath: path.join(__dirname, '../fixtures/locales/US/es')
                }
            }
        });

        request(app)
            .get('/templates/localized.js')
            .expect(200)
            .expect(/dust.register\("localized"/)
            .expect(/Hola/)
            .end(done);
    });


    it('Errors on invalid inputs', function (done) {
        var app = testutil.createApp({
            dust: {
                module: './lib/plugins/dust',
                files: '/templates/**/*.js',
                base: '/templates'
            }
        });

        request(app)
            .get('/templates/invalid.js')
            .expect(500)
            .end(done);
    });


    it('Errors on missing includes', function (done) {
        var app = testutil.createApp({
            dust: {
                module: './lib/plugins/dust',
                files: '/templates/**/*.js',
                base: '/templates'
            }
        });

        request(app)
            .get('/templates/missing.js')
            .expect(404)
            .end(done);
    });


});