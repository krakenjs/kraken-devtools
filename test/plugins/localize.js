/*global describe, it, before, beforeEach, after, afterEach*/

"use strict";

var localize = require("../../plugins/localize"),
	path = require('path'),
	assert = require("assert");

describe("plugins:localize", function () {
	it("should not crash", function() {
		localize.localize("badfile", "badfile2", function(err) {
			assert.ok(err);
		});
	});

	it(".preHook() regex should process locale for alpha country-codes like HK/zh (HK-zh)", function(done) {
		// config stub
		var configStub = {
			srcRoot: path.resolve('test/fixtures/public'),
			destRoot: path.resolve('test/tmp'),
			filePath: 'templates/HK/zh/localized.js',
			name: 'HK/zh/localized',
			ext: 'dust'
		};

		var cb = function(err, obj){
			assert.equal(err, null);

			var country = obj.locality.country;
			var language = obj.locality.language;

			assert.equal(country, 'HK');
			assert.equal(language, 'zh');

			done();
		};


		localize.preHook(configStub, cb);
	});

	it(".preHook() regex should process locale for alphanumeric country-codes like C2/zh (zh-C2)", function(done) {
		// config stub
		var configStub = {
			srcRoot: path.resolve('test/fixtures/public'),
			destRoot: path.resolve('test/tmp'),
			filePath: '/templates/C2/zh/localized.js',
			name: 'C2/zh/localized',
			ext: 'dust'
		};

		var cb = function(err, obj){
			assert.equal(err, null);

			var country = obj.locality.country;
			var language = obj.locality.language;

			assert.equal(country, 'C2');
			assert.equal(language, 'zh');

			done();
		};


		localize.preHook(configStub, cb);
	});

	it(".preHook() regex should process locale for long country-groups like GROUP/es (es-GROUP)", function(done) {
		// config stub
		var configStub = {
			srcRoot: path.resolve('test/fixtures/public'),
			destRoot: path.resolve('test/tmp'),
			filePath: '/templates/GROUP/es/localized.js',
			name: 'GROUP/es/localized',
			ext: 'dust'
		};

		var cb = function(err, obj){
			assert.equal(err, null);

			var country = obj.locality.country;
			var language = obj.locality.language;

			assert.equal(country, 'GROUP');
			assert.equal(language, 'es');

			done();
		};


		localize.preHook(configStub, cb);
	});

});
