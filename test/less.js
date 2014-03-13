/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var path = require('path'),
    rimraf = require('rimraf'),
    devtools = require('../lib/plugins');


describe('less compiler', function () {

    var srcRoot, staticRoot, paths = require('./config.json').less;

    function resetEnv(next) {
        rimraf(staticRoot, next);
    }


    function factory(config) {
        return devtools.less(srcRoot, staticRoot, config);
    }


    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
        paths.srcRoot = srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        paths.staticRoot = staticRoot = path.join(process.cwd(), 'fixtures', '.build');
    });


    after(resetEnv);


    require('./middleware').handleRequests('css/less', paths, factory);

    require('./hooks').executeHooks('css/less', '/css/less/app.css', factory);

});