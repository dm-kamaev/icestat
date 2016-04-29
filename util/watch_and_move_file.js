#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ОПИСАНИЕ СКРИПТА

var CONF  = require('/icestat/config.js').settings();
var fs    = require('fs');
var child = require(CONF.my_modules + 'child.js');
// var db    = require(CONF.my_modules   + 'usedb.js');
// var asc   = require(CONF.my_modules + 'asc.js');
// var time  = require(CONF.my_modules + 'time.js');
// var wf    = require(CONF.my_modules   + 'wf.js');
// var tr    = require(CONF.my_modules   + 'transform_data_from_file_or_base.js');

// var get_exist_tables = require(CONF.oft_modules + 'get_exist_tables.js');

set_watch_move_by_scp();
function set_watch_move_by_scp () {
  fs.watchFile('/icestat/util/insert_playlist_authorSongname.js', function (curr, prev) {
    // console.log('the current mtime is: ' + curr.mtime);
    // console.log('the previous mtime was: ' + prev.mtime);
    child.simple_call('scp /icestat/util/insert_playlist_authorSongname.js  root@95.213.143.80:/icestat/util/insert_playlist_authorSongname.js;');
  });
}