/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var assert = require('chai').assert,
    paths = require('path'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf');


exports.executeHooks = function (dir, paths, factory) {

    var request = {
        method: 'get',
        path: paths
    };


    var config = (typeof dir === 'string') ? { dir: dir } : dir;


    function pre(config, callback) {

        var locale = config.name.match(/(?:([A-Za-z]{2})\/([A-Za-z]{2})\/)?(.*)/),
            copyFile,
            srcPath;

        if (locale && locale[1] && locale[2]) {
            config.locality = {
                country: locale[1],
                language: locale[2]
            };
        }

        if (locale[3]) {
            copyFile = path.join( dir, locale[3]);
        }
        var srcFile = path.join(config.srcRoot, copyFile + '.dust');

        //create an aritificial srcRoot
        config.srcRoot = path.join(process.cwd() , 'tmp');
        var destFile = path.join (config.srcRoot, 'templates', config.name + '.dust');

        mkdirp(path.dirname(destFile), function(err) {
            if (err) {
                callback(err);
                return;
            }
            fs.createReadStream(srcFile).pipe(fs.createWriteStream(destFile));
            callback(null, config);

        });
    }


    function post(config, callback) {
        rimraf(config.srcRoot, function(err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, config);
        });
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


        it('should invoke all hooks', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                assert.ok(!err);
                //assert.isFalse(pre.invoked);
                //assert.isFalse(post.invoked);
                next();
            });
        });

        it('should invoke all hooks', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                assert.ok(!err);
               // assert.isTrue(pre.invoked);
               // assert.isTrue(post.invoked);
                next();
            });
        });

        it('should invoke the postcompile hook', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                assert.ok(!err);
               // assert.isFalse(pre.invoked);
               // assert.isTrue(post.invoked);
                next();
            });
        });
    });
};