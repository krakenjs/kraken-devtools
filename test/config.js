/*global describe:false, it:false, before:false, after:false, afterEach:false*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    fsutils = require('fsutils'),
    devtools = require('../index'),
    assert = require('chai').assert;

describe('config-based middleware', function () {

    var srcRoot, staticRoot;

    function resetEnv(next) {
        fsutils.rmdirf(staticRoot, next);
    }

    before(function () {
        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);
        srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        staticRoot = path.join(process.cwd(), 'fixtures', '.build');
    });


    after(resetEnv);


    describe('middleware', function () {

        var middleware;
        var req = { method: 'get', path: '' };
        var res = {};

        var config = {
            'dust': 'templates',
            'less': 'css/less',
            'sass': 'css/sass',
            'default': ''
        };


        it('should create middleware', function () {
            middleware = devtools.compiler(srcRoot, staticRoot, config);
            assert.isFunction(middleware);
        });


//        it('should ignore non-GET requests', function (next) {
//            var method = req.method;
//            req.method = 'POST';
//            req.path = '/img/nyan.jpg';
//
//            middleware(req, res, function (err) {
//                assert.ok(!err);
//                fs.readFile(path.join(staticRoot, req.path), function (err, body) {
//                    assert.ok(err);
//                    assert.equal(err.code, 'ENOENT');
//
//                    // Reset method
//                    req.method = method;
//                    next();
//                });
//            });
//        });
//
//
//        it('should copy a file without error', function (next) {
//            req.path = '/img/nyan.jpg';
//
//            middleware(req, res, function (err) {
//                assert.ok(!err);
//                fs.readFile(path.join(staticRoot, req.path), function (err, body) {
//                    assert.ok(!err);
//                    assert.ok(body.length);
//                    next();
//                });
//            });
//        });
//
//
//        it('should copy a file in a nested directory', function (next) {
//            req.path = '/img/wow/nyan.jpg';
//
//            middleware(req, res, function (err) {
//                assert.ok(!err);
//                fs.readFile(path.join(staticRoot, req.path), function (err, body) {
//                    assert.ok(!err);
//                    assert.ok(body.length);
//                    next();
//                });
//            });
//        });
//
//
//        it('should not copy a missing file', function (next) {
//            req.path = '/img/batboy.png';
//
//            middleware(req, res, function (err) {
//                // This should fail silently when the template is not found as static will return a 404.
//                assert.ok(!err);
//                fs.readFile(path.join(staticRoot, req.path), function (err, body) {
//                    assert.ok(err);
//                    assert.ok(!body);
//                    next();
//                });
//            });
//        });

    });


    describe('middleware with object config', function () {

        var middleware;
        var req = { method: 'get', path: '/img/nyan.jpg' };
        var res = {};


        it('should create middleware', function () {
            middleware = devtools.default(srcRoot, staticRoot, {});
            assert.isFunction(middleware);
        });


        it('should copy a file without error', function (next) {
            req.path = '/img/nyan.jpg';

            middleware(req, res, function (err) {
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), function (err, body) {
                    assert.ok(!err);
                    assert.ok(body.length);
                    next();
                });
            });
        });

    });


    describe('compilation hooks', function () {

        var req = { method: 'get', path: '/img/nyan.jpg' };
        var res = {};

        describe('precompile', function () {

            before(resetEnv);

            it('should invoke the provided precompile hook', function (next) {
                var middleware, invoked;

                invoked = false;
                function precompile(context, callback) {
                    invoked = true;
                    callback(null, context);
                }

                middleware = devtools.default(srcRoot, staticRoot, { precompile: precompile });
                middleware(req, res, function (err) {
                    assert.ok(!err);
                    assert.ok(invoked);
                    fs.readFile(path.join(staticRoot, req.path), function (err, body) {
                        assert.ok(!err);
                        assert.ok(body);
                        next();
                    });
                });
            });

        });


        describe('postcompile', function () {

            before(resetEnv);

            it('should invoke the provided postcompile hook', function (next) {
                var middleware, invoked;

                invoked = false;
                function postcompile(context, callback) {
                    invoked = true;
                    callback(null, context);
                }

                middleware = devtools.default(srcRoot, staticRoot, { postcompile: postcompile });
                middleware(req, res, function (err) {
                    assert.ok(!err);
                    assert.ok(invoked);
                    fs.readFile(path.join(staticRoot, req.path), function (err, body) {
                        assert.ok(!err);
                        assert.ok(body);
                        next();
                    });
                });
            });

        });


        describe('all', function () {

            before(resetEnv);

            it('should invoke all hooks', function (next) {
                var middleware, invokedPre, invokedPost;

                invokedPre = false;
                invokedPost = false;

                function precompile(context, callback) {
                    invokedPre = true;
                    callback(null, context);
                }

                function postcompile(context, callback) {
                    invokedPost = true;
                    callback(null, context);
                }

                middleware = devtools.default(srcRoot, staticRoot, { precompile: precompile, postcompile: postcompile });
                middleware(req, res, function (err) {
                    assert.ok(!err);
                    assert.ok(invokedPre);
                    assert.ok(invokedPost);
                    fs.readFile(path.join(staticRoot, req.path), function (err, body) {
                        assert.ok(!err);
                        assert.ok(body);
                        next();
                    });
                });

            });

        });


    });

});