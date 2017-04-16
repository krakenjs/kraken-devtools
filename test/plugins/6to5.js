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
	testutil = require('../util');


describe('plugins:6to5', function () {


	afterEach(function () {
		testutil.cleanUp();
	});


	it('compiles to es5', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/6to5',
				files: '/js/**/*.js'
			}
		});

		request(app)
			.get('/js/6to5.js')
			.expect(200)
			.end(done);
	});


	it('Errors on invalid inputs', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/6to5',
				files: '/js/**/*.js'
			}
		});

		request(app)
			.get('/css/less/invalid.css')
			.expect(500)
			.end(done);
	});


	it('Errors on missing includes', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/less',
				files: '/css/**/*.css'
			}
		});

		request(app)
			.get('/css/less/missing.js')
			.expect(500)
			.end(done);
	});


});