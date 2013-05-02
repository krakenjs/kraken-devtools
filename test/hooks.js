/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var assert = require('chai').assert;


exports.executeHooks = function (dir, path, factory) {

    var request = {
        method: 'get',
        path: path
    };


    var config = (typeof dir === 'string') ? { dir: dir } : dir;


    function pre(config, callback) {
        pre.invoked = true;
        callback(null, config);
    }


    function post(config, callback) {
        post.invoked = true;
        callback(null, config);
    }

    describe('compilation hooks', function () {

        beforeEach(function () {
            pre.invoked = false;
            post.invoked = false;

            // Simple state matcheen
            if (!config.precompile) {
                config.precompile = pre;
            } else {
                if (!config.postcompile) {
                    config.precompile = undefined;
                    config.postcompile = post;
                }
            }
        });


        it('should invoke the precompile hook', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                assert.ok(!err);
                assert.isTrue(pre.invoked);
                assert.isFalse(post.invoked);
                next();
            });
        });


        it('should invoke the postcompile hook', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                assert.ok(!err);
                assert.isFalse(pre.invoked);
                assert.isTrue(post.invoked);
                next();
            });
        });


        it('should invoke all hooks', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                assert.ok(!err);
                assert.isTrue(pre.invoked);
                assert.isTrue(post.invoked);
                next();
            });
        });

    });
};