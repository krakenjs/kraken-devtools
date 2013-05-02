/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var path = require('path'),
    fsutils = require('fsutils'),
    devtools = require('../index');


exports.paths = {
    valid: '/css/less/app.css',
    invalid: '/css/less/invalid.css',
    nested: '/css/less/inc/colors.css',
    nonexistent: '/css/less/unknown.css',
    unrecognized: '/css/less/invalid.sass',
    similar: '/css/less/similar',
    unknown: '/tmpl/whatthewhat'
}


describe('less compiler', function () {

    var srcRoot, staticRoot, paths = exports.paths;

    function resetEnv(next) {
        fsutils.rmdirf(staticRoot, next);
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