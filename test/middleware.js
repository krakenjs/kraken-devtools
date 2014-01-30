/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    assert = require('chai').assert;


exports.handleRequests = function (dir, paths, factory) {


    beforeEach(function (next) {
        rimraf(paths.staticRoot, next);
    });


    if (typeof dir === 'string') {

        describe('string config', function () {

            it('should create middleware', function () {
                this.middleware = factory(dir);
                assert.isFunction(this.middleware);
            });

            exports._handleRequests(paths);

        });


        describe('object config', function () {

            it('should create middleware', function () {
                this.middleware = factory({ dir: dir });
                assert.isFunction(this.middleware);
            });

            exports._handleRequests(paths);

        });

    } else {


        it('should create middleware', function () {
            this.middleware = factory(dir);
            assert.isFunction(this.middleware);
        });

        exports._handleRequests(paths);

    }

};


exports._handleRequests = function (paths) {

    var req = { method: 'GET', path: '' };
    var res = {};


    function itIf(cond, name, fn) {
        if (!fn) {
            it(cond, name);
            return;
        }

        if (cond) {
            it(name, fn);
            return;
        }

        it.skip(name, fn);
    }


    function exists(file, cb) {
        fs.readFile(file, function (err, body) {

            err && console.log(err.message);
            assert.ok(!err);
            assert.ok(body);
            assert.ok(body.length);
            cb();
        });
    }


    function notExists(file, cb) {
        fs.readFile(file, function (err) {
            assert.ok(err);
            assert.equal(err.code, 'ENOENT');
            cb();
        });
    }


    itIf(paths.valid, 'should ignore non-GET requests', function (next) {
        var method = req.method;
        req.method = 'POST';
        req.path = paths.valid;

        this.middleware(req, res, function (err) {
            assert.ok(!err);
            notExists(path.join(paths.staticRoot, req.path), function () {
                // Reset method
                req.method = method;
                next();
            });
        });
    });


    itIf(paths.valid, 'should handle a known file without error', function (next) {
        req.path = paths.valid;

        this.middleware(req, res, function (err) {
            assert.ok(!err);
            exists(path.join(paths.staticRoot, req.path), next);
        });
    });

    itIf(paths.numbered, 'should handle a numbered file extension without error', function (next) {
        req.path = paths.numbered;

        this.middleware(req, res, function (err) {
            assert.ok(!err);
            exists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.nested, 'should handle a template in a nested directory', function (next) {
        req.path = paths.nested;

        this.middleware(req, res, function (err) {
            assert.ok(!err);
            exists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.nonexistent, 'should not handle an unavailable template', function (next) {
        req.path = paths.nonexistent;

        this.middleware(req, res, function (err) {
            // This should fail silently when the template is not found as static will return a 404.
            assert.ok(!err);
            notExists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.invalid, 'should fail on error', function (next) {
        req.path = paths.invalid;

        this.middleware(req, res, function (err) {
            // This should error since the template is invalid and compilation failed.
            assert.ok(err);
            notExists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.unrecognized, 'should ignore paths with unrecognized extensions', function (next) {
        req.path = paths.unrecognized;

        this.middleware(req, res, function (err) {
            // This not error since the path is not supported for this configuration.
            assert.ok(!err);
            notExists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.similar, 'should ignore similar paths', function (next) {
        req.path = paths.similar;

        this.middleware(req, res, function (err) {
            // This not error since the path is not supported for this configuration.
            assert.ok(!err);
            notExists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.unknown, 'should ignore unknown paths', function (next) {
        req.path = paths.unknown;

        this.middleware(req, res, function (err) {
            // This not error since the path is not supported for this configuration.
            assert.ok(!err);
            notExists(path.join(paths.staticRoot, req.path), next);
        });
    });


    itIf(paths.missing, 'should error on missing includes', function (next) {
        req.path = paths.missing;

        this.middleware(req, res, function (err) {
            assert.ok(err);
            notExists(path.join(paths.staticRoot, req.path), next);
        });
    });

};