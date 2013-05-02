/*global describe:false, it:false, before:false, after:false, afterEach:false*/
'use strict';

var devtools = require('../index');

describe('compiler hooks (experimental)', function () {

    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
    });

});