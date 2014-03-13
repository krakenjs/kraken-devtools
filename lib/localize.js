'use strict';
var concat = require('concat-stream'),
    localizr = require('localizr'),
    path = require('path'),
    fs = require('fs');

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
