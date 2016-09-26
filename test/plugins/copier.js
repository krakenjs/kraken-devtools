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
/*global describe, it, before, beforeEach, after, afterEach*/

'use strict';


var request = require('supertest'),
    testutil = require('../util');


describe('plugins:copier', function () {


    after(function () {
        testutil.cleanUp();
    });


    it('copies static files', function (done) {
        var app = testutil.createApp({
            copier: {
                module: './plugins/copier',
                files: '**/*'
            }
        });

        request(app)
            .get('/img/nyan.jpg')
            .expect(200)
            .end(done);
    });


    it('copies nested static files', function (done) {
        var app = testutil.createApp({
            copier: {
                module: './plugins/copier',
                files: '**/*'
            }
        });

        request(app)
            .get('/img/wow/nyan.jpg')
            .expect(200)
            .end(done);
    });


    it('Copies files with no extension', function (done) {
        var app = testutil.createApp({
            copier: {
                module: './plugins/copier',
                files: '**/*'
            }
        });

        request(app)
            .get('/img/altfile')
            .expect(200)
            .end(done);
    });

    it('Assumes index.html on trailing slash paths', function (done) {
        var app = testutil.createApp({
            copier: {
                module: './plugins/copier',
                files: '**/*'
            }
        });

        request(app)
            .get('/img/omgpath/')
            .expect(200)
            .end(done);
    });


    it('Should not barf on a paths with special characters', function (done) {
        var app = testutil.createApp({
            copier: {
                module: './plugins/copier',
                files: '**/*'
            }
        });

        var paths = ['/img/omg.path/', '/img/omg.path/omg.file.png',
                     '/img/omg+path/', '/img/omg+path/omg+file.png',
                     '/img/omg.file[aeiou]'];

        req();

        function req() {
            var path;
            if (path = paths.shift()) {
                request(app)
                  .get(path)
                  .expect(200)
                  .end(req);
            } else {
                done.apply(null, arguments);
            }
        }
    });
    

    it('Ignores missing files', function (done) {
        var app = testutil.createApp({
            copier: {
                module: './plugins/copier',
                files: '**/*'
            }
        });

        request(app)
            .get('/img/batboy.jpg')
            .expect(404)
            .end(done);
    });


});
