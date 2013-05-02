/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var path = require('path'),
    fsutils = require('fsutils'),
    devtools = require('../index');

var hooks = require('./hooks');


describe('config-based compiler', function () {

    var srcRoot, staticRoot, paths, config;

    paths = {
        dust: require('./dust').paths,
        less: require('./less').paths,
        sass: require('./sass').paths
    };


    config = {
        dust: {
            dir: 'templates'
        },
        less: {
            dir: 'css/less'
        },
        sass: {
            dir: 'css/sass'
        }
    };


    function resetEnv(next) {
        fsutils.rmdirf(staticRoot, next);
    }


    function factory(config) {
        return devtools.compiler(srcRoot, staticRoot, config);
    }


    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
        srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        staticRoot = path.join(process.cwd(), 'fixtures', '.build');

        Object.keys(paths).forEach(function (name) {
            paths[name].srcRoot = srcRoot;
            paths[name].staticRoot = staticRoot;
        });
    });


    after(resetEnv);

    describe('dust', function () {
        require('./middleware').handleRequests(config, paths.dust, factory);
    });


    describe('less', function () {
        require('./middleware').handleRequests(config, paths.less, factory);
    });


    describe('sass', function () {
        require('./middleware').handleRequests(config, paths.sass, factory);
    });

});