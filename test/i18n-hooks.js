/*global describe:false, it:false, before:false, after:false, beforeEach:false, afterEach:false*/
'use strict';

var assert = require('chai').assert,
    path = require('path'),
    fs = require('fs');


exports.executeHooks = function (dir, paths, factory) {

    var request = {
        method: 'get',
        path: paths
    };


    var config = (typeof dir === 'string') ? { dir: dir } : dir;

    describe('compilation hooks', function () {

        it('should invoke all hooks and check if the localized file was generated', function (next) {
            var middleware = factory(config);
            middleware(request, {}, function (err) {
                var genFile = path.join(process.cwd(), 'fixtures', '.build', paths);
                assert.ok(!err);
                assert.equal(true, fs.existsSync(genFile));
                next();
            });
        });
    });
};