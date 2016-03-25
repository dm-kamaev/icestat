#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// РАБОТА  С ФАЙЛАМИ И КАТАЛОГАМИ

var CONF = require('/icestat/config.js').settings();
var fs   = require('fs');
var asc  = require(CONF.my_modules + 'asc');
// var wf    = require(CONF.my_modules   + 'wf.js');
// var db    = require(CONF.my_modules   + 'usedb.js');
// var tr    = require(CONF.my_modules   + 'transform_data_from_file_or_base.js');


// get_list_folders('/icestat/', function(err, res) {
//   console.log(err || res)
// });
function get_list_folders (path, callback_main) {
  var res = [];
  fs.readdir(path, function(err, files) {
    var array_path = [];
    for (var i = 0, l = files.length; i < l; i++) {
      array_path.push(path+files[i]);
    }
    var st = function(path_files, cb) {
      fs.stat(path_files, function(err, stats) {
        if (!err) {
          if (stats.isDirectory()) {
            cb(null, path_files);
          } else {
            cb(null, null)
          }
        } else {
          cb(err, path_files);
        }
      });
    };
    asc.ar_series(st, array_path, function(err, result) {
      callback_main(err || null, result || null);
    });
  });
}
exports.get_list_folders = get_list_folders;




