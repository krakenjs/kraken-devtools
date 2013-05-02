/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var path = require('path'),
    fsutils = require('fsutils'),
    devtools = require('../index');



describe('dust compiler', function () {

    var srcRoot, staticRoot, paths = require('./config.json').dust;


    function resetEnv(next) {
        fsutils.rmdirf(staticRoot, next);
    }


    function factory(config) {
        return devtools.dust(srcRoot, staticRoot, config);
    }


    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
        paths.srcRoot = srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        paths.staticRoot = staticRoot = path.join(process.cwd(), 'fixtures', '.build');
    });


    after(resetEnv);

    require('./middleware').handleRequests('templates', paths, factory);

    require('./hooks').executeHooks('templates', '/templates/index.js', factory);

});