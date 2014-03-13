/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var path = require('path'),
    rimraf = require('rimraf'),
    devtools = require('../lib/plugins');

var hooks = require('./hooks');


describe('default copier', function () {

    var srcRoot, staticRoot, paths = {
        valid: '/img/nyan.jpg',
        nested: '/img/wow/nyan.jpg',
        nonexistent: '/img/batboy.png',
        similar: '/img/altfile'
    };


    function resetEnv(next) {
        rimraf(staticRoot, next);
    }


    function factory(config) {
        return devtools.default(srcRoot, staticRoot, config);
    }


    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
        paths.srcRoot = srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        paths.staticRoot = staticRoot = path.join(process.cwd(), 'fixtures', '.build');
    });


    after(resetEnv);

    require('./middleware').handleRequests('', paths, factory);

    require('./hooks').executeHooks('', '/img/nyan.jpg', factory);

});

