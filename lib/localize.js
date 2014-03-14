'use strict';
var concat = require('concat-stream'),
    localizr = require('localizr'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf');

exports.localize = function localize(srcFile, propFile, cb) {
    var opt = {
        src: srcFile,
        props: propFile
    };

    var out = concat({ encoding: 'string'}, function (data) {
        cb(null, data);
    });
    try {
        localizr.createReadStream(opt).pipe(out);
    } catch (err) {
        cb(err);
    }
};

exports.preHook = function pre(config, callback) {

    var locale = config.name.match(/(?:([A-Za-z]{2})\/([A-Za-z]{2})\/)?(.*)/),
        copyFile,
        dir,
        srcFile,
        destFile;

    if (locale && locale[1] && locale[2]) {
        config.locality = {
            country: locale[1],
            language: locale[2]
        };
    }

    if (locale[3]) {
        dir = config.filePath.replace(path.extname(config.filePath), '');
        dir = dir.replace(config.name, '').replace(path.sep, '', 'g');
        copyFile = path.join( dir, locale[3]);
    }
    srcFile = path.join(config.srcRoot, copyFile + '.dust');

    //create an aritificial srcRoot
    config.srcRoot = path.join(process.cwd() , 'tmp');
    destFile = path.join (config.srcRoot, 'templates', config.name + '.dust');

    mkdirp(path.dirname(destFile), function(err) {
        if (err) {
            callback(err);
            return;
        }
        fs.createReadStream(srcFile).pipe(fs.createWriteStream(destFile));
        callback(null, config);

    });
};

exports.postHook = function post(config, callback) {
    rimraf(config.srcRoot, function(err) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, config);
    });
};