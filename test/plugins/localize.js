/*global describe, it, before, beforeEach, after, afterEach*/

"use strict";

var localize = require("../../plugins/localize"),
	assert = require("assert");

describe("plugins:localize", function () {
	it("should not crash", function() {
		localize.localize("badfile", "badfile2", function(err) {
			assert.ok(err);
		});
	});
});