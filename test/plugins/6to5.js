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
	assert = require('assert'),
	testutil = require('../util');


describe('plugins:6to5', function () {


	afterEach(function () {
		testutil.cleanUp();
	});


	it('compiles to es5', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/6to5',
				files: '/js/**/es6*.js'
			}
		});

		request(app)
			.get('/js/es6-good.js')
			.expect(200)
			.end(function(err, response) {
				var code = '"use strict";\n\nvar y = function (x) {\n  return x * 2;\n};';
				assert.equal(response.res.text, code);
				done();
			});
	});

	it('should warn on invalid syntax', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/6to5',
				files: '/js/**/es6*.js'
			}
		});

		request(app)
			.get('/js/es6-bad.js')
			.expect(500)
			.end(done);
	});

	it('should support react stuff', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/6to5',
				files: '/js/**/es6*.js'
			}
		});

		request(app)
			.get('/js/es6-react.js')
			.end(function(err, response) {
				assert.equal(response.res.text, '"use strict";\n\nexports["default"] = React.createElement("div", null);');
				done();
			});
	});

	it('should support options (such as AMD and disabling use strict)', function (done) {
		var app = testutil.createApp({
			"6to5": {
				module: './plugins/6to5',
				files: '/js/**/es6*.js',
				options: {
					modules: 'amd',
					blacklist: ['useStrict']
				}
			}
		});

		request(app)
			.get('/js/es6-react.js')
			.end(function(err, response) {
				var code = 'define(["exports"], function (exports) {\n  exports["default"] = React.createElement("div", null);\n});';
				assert.equal(response.res.text, code);
				done();
			});
	});

});