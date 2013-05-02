/*global describe:false, it:false, before:false, after:false, afterEach:false*/
'use strict';

var http = require('http'),
    path = require('path'),
    express = require('express'),
    fsutils = require('fsutils'),
    assert = require('chai').assert,
    devtools = require('../index');


describe.skip('compiler', function () {

    var app, server, srcRoot, staticRoot;

    function precompile(context, callback) {
        var fs = require('fs'),
            mkdirp = require('mkdirp');

        var srcFile, destFile;
        srcFile = destFile = context.filePath.replace(path.extname(context.filePath), '') + '.dust';

        var srcPath = path.join(context.srcRoot, srcFile);
        srcPath = srcPath.replace(/(?:([a-z]{2}_[A-Z]{2})\/)/, function () {
            context.srcRoot = path.join(context.srcRoot, 'tmp');
            return '';
        });

        var destPath = path.join(context.srcRoot, destFile);

        fs.readFile(srcPath, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            mkdirp(path.dirname(destPath), function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                fs.writeFile(destPath, data, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    context.name = context.name.replace(/(?:([a-z]{2}_[A-Z]{2})\/)/, '');
                    callback(null, context);
                });
            });
        });
    }


    function postcompile(context, callback) {
        var fs = require('fsutils');
        if (context.srcRoot.indexOf('tmp') === context.srcRoot.length - 3) {
            fs.rmdirf(context.srcRoot, function (err) {
                callback(err, context);
            });
        } else {
            callback(null, context);
        }
    }


    before(function (next) {
        var options;

        // Ensure the test case assumes it's being run from application root.
        // Depending on the test harness this may not be the case, so shim.
        process.chdir(__dirname);

        options = {
            srcRoot: path.join(process.cwd(), 'fixtures', 'public'),
            compilers: {
                'dust': {
                    dir: 'templates',
                    precompile : precompile,
                    postcompile: postcompile
                },
                'less': {
                    dir: 'css/less'
                },
                'sass': {
                    dir: 'css/sass'
                },
                'default': {
                    dir: ''
                }
            }
        };

        srcRoot = path.join(process.cwd(), 'fixtures', 'public');
        staticRoot = path.join(process.cwd(), 'fixtures', '.build');

        app = express();
        app.use(devtools.dust(srcRoot, staticRoot, options.compilers.dust));
        app.use(devtools.less(srcRoot, staticRoot, options.compilers.less));
        app.use(devtools.sass(srcRoot, staticRoot, options.compilers.sass));
        app.use(devtools.default(srcRoot, staticRoot, options.compilers.default));
        app.use(express.static(staticRoot));
        server = app.listen(8000, next);
    });


    after(function (next) {
        server.once('close', function () {
            //fsutils.rmdirf(staticRoot, next);
            next();
        });
        server.close();
    });


    it('should compile a template', function (next) {
        inject('/templates/index.js', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });


    it('should compile a namespaced template', function (next) {
        inject('/templates/inc/partial.js', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });


    it('should use custom precompiler', function (next) {
        inject('/templates/en_US/inc/partial.js', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });


    it('should load javascript', function (next) {
        inject('/js/main.js', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });

//    it.skip('should invoke r.js for javascript', function (next) {
//        inject('/js/main.js', function (err, data) {
//            assert.ok(!err);
//            assert.ok(data);
//            next();
//        });
//    });


    it('should compile less to css', function (next) {
        inject('/css/less/app.css', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });

    it('should compile sass to css', function (next) {
        inject('/css/sass/sassy.css', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });

    it('should compile less files in nested directories', function (next) {
        inject('/css/less/inc/colors.css', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });


    it('should copy unhandled files', function (next) {
        inject('/img/nyan.jpg', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            next();
        });
    });

});



function inject(path, callback) {
    var req = http.request({ method: 'GET', port: 8000, path: path }, function (res) {
        var data = [];

        res.on('data', function (chunk) {
            data.push(chunk)
        });

        res.on('end', function () {
            var body = Buffer.concat(data).toString('utf8');
            if (res.statusCode !== 200) {
                callback(new Error(body));
                return;
            }
            callback(null, body);
        });
    });
    req.on('error', callback);
    req.end();
}