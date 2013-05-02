/*global describe:false, it:false, before:false, after:false, afterEach:false*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    fsutils = require('fsutils'),
    dust = require('dustjs-linkedin'),
    assert = require('chai').assert,
    devtools = require('../index');


describe('dust compiler', function () {

    var srcRoot, staticRoot;

    function resetEnv(next) {
        dust.cache = [];
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
        var req = { method: 'GET', path: '' };
        var res = {};


        it('should create middleware', function () {
            middleware = devtools.dust(srcRoot, staticRoot, 'templates');
            assert.isFunction(middleware);
        });


        it('should ignore non-GET requests', function (next) {
            var method = req.method;
            req.method = 'POST';
            req.path = '/templates/index.js';

            middleware(req, res, function (err) {
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                    assert.ok(err);
                    assert.equal(err.code, 'ENOENT');

                    // Reset method
                    req.method = method;
                    next();
                });
            });
        });


        it('should compile a known template without error', function (next) {
            req.path = '/templates/index.js';

            middleware(req, res, function (err) {
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                    assert.ok(!err);
                    dust.loadSource(body);
                    assert.isFunction(dust.cache['index']);
                    next();
                });
            });
        });


        it('should compile a template in a nested directory', function (next) {
            req.path = '/templates/inc/partial.js';

            middleware(req, res, function (err) {
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                    assert.ok(!err);
                    dust.loadSource(body);
                    assert.isFunction(dust.cache['index']);
                    next();
                });
            });
        });


        it('should not compile an unavailable template', function (next) {
            req.path = '/templates/unknown.js';

            middleware(req, res, function (err) {
                // This should fail silently when the template is not found as static will return a 404.
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                    assert.ok(err);
                    assert.ok(!body);
                    next();
                });
            });
        });


        it('should fail on a compilation error', function (next) {
            req.path = '/templates/invalid.js';

            middleware(req, res, function (err) {
                // This should error since the template is invalid and compilation failed.
                assert.ok(err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err) {
                    assert.ok(err);
                    next();
                });
            });
        });


        it('should ignore paths with unrecognized extensions', function (next) {
            req.path = '/templates/invalid.dust';

            middleware(req, res, function (err) {
                // This not error since the path is not supported for this configuration.
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err) {
                    assert.ok(err);
                    next();
                });
            });
        });


        it('should ignore similar paths', function (next) {
            req.path = '/templates/whatthewhat';

            middleware(req, res, function (err) {
                // This not error since the path is not supported for this configuration.
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err) {
                    assert.ok(err);
                    next();
                });
            });
        });


        it('should ignore unknown paths', function (next) {
            req.path = '/tmpl/whatthewhat';

            middleware(req, res, function (err) {
                // This not error since the path is not supported for this configuration.
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err) {
                    assert.ok(err);
                    next();
                });
            });
        });

    });


    describe('middleware with object config', function () {

        var middleware;
        var req = { method: 'get', path: '' };
        var res = {};


        before(resetEnv);


        it('should create middleware', function () {
            middleware = devtools.dust(srcRoot, staticRoot, { dir: 'templates' });
            assert.isFunction(middleware);
        });


        it('should compile a known template without error', function (next) {
            req.path = '/templates/index.js';

            middleware(req, res, function (err) {
                assert.ok(!err);
                fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                    assert.ok(!err);
                    dust.loadSource(body);
                    assert.isFunction(dust.cache['index']);
                    next();
                });
            });
        });

    });


    describe('compilation hooks', function () {

        var req = { method: 'get', path: '/templates/index.js' };
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

                middleware = devtools.dust(srcRoot, staticRoot, { dir: 'templates', precompile: precompile });
                middleware(req, res, function (err) {
                    assert.ok(!err);
                    assert.ok(invoked);
                    fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                        assert.ok(!err);
                        dust.loadSource(body);
                        assert.isFunction(dust.cache['index']);
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

                middleware = devtools.dust(srcRoot, staticRoot, { dir: 'templates', postcompile: postcompile });
                middleware(req, res, function (err) {
                    assert.ok(!err);
                    assert.ok(invoked);
                    fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                        assert.ok(!err);
                        dust.loadSource(body);
                        assert.isFunction(dust.cache['index']);
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

                middleware = devtools.dust(srcRoot, staticRoot, { dir: 'templates', precompile: precompile, postcompile: postcompile });
                middleware(req, res, function (err) {
                    assert.ok(!err);
                    assert.ok(invokedPre);
                    assert.ok(invokedPost);
                    fs.readFile(path.join(staticRoot, req.path), 'utf8', function (err, body) {
                        assert.ok(!err);
                        dust.loadSource(body);
                        assert.isFunction(dust.cache['index']);
                        next();
                    });
                });

            });

        });


    });


});