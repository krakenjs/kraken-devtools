/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var path = require('path'),
    fsutils = require('fsutils'),
    devtools = require('../index');


exports.paths = {
    valid: '/css/sass/app.css',
    invalid: '/css/sass/invalid.css',
    nested: '/css/sass/inc/colors.css',
    nonexistent: '/css/sass/unknown.css',
    unrecognized: '/css/sass/invalid.sass',
    similar: '/css/sass/similar',
    unknown: '/tmpl/whatthewhat'
};


describe('sass compiler', function () {

    var srcRoot, staticRoot, paths = exports.paths;

    function resetEnv(next) {
        fsutils.rmdirf(staticRoot, next);
    }


    function factory(config) {
        return devtools.sass(srcRoot, staticRoot, config);
    }


    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
        paths.srcRoot = srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        paths.staticRoot = staticRoot = path.join(process.cwd(), 'fixtures', '.build');
    });


    after(resetEnv);

    require('./middleware').handleRequests('css/sass', paths, factory);

    require('./hooks').executeHooks('css/sass', '/css/sass/app.css', factory);

});