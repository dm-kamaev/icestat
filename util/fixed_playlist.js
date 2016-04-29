#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ДЛЯ `playlist_xmusicradio.hostingradio.ru`.`2016-04-18` заполнил заново поля author and song_name from
// field meta

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc.js');
var db    = require(CONF.my_modules + 'usedb.js');
var fn    = require(CONF.my_modules + 'fn.js');

var CONTEXT = require('/icestat/my/context.js').add_set_get({});

var BASE = 'playlist_xmusicradio.hostingradio.ru';
var DATE = '2016-04-21';

// start();
// ---------------------------------------------------------------------------------------------------
function start () {
  asc.series([
    function(cbm) { read_data(CONTEXT, cbm); },
    function(cbm) { update_authorSong_name(CONTEXT, cbm); },
    ],function(err, result) {
      console.log('\n\n async FIXED_PLAYLIST.JS series dine: ', err || result);
  });
}
// ---------------------------------------------------------------------------------------------------// body...


function read_data (CONTEXT, cb_main) {
  var query = "SELECT id, date, meta FROM `"+BASE+"`.`"+DATE+"`";
  db.read(query, function(err, res) {
    if (!err) CONTEXT.set('data', res);
    cb_main(err || null, 'read_data');
  });
}

//
function update_authorSong_name (CONTEXT, cb_main) {
  var data    = CONTEXT.get('data');
  var queries = [];
  for (var i = 0, l = data.length; i < l; i++) {
    var song      = data[i];
    var match     = song.meta.split('-');
    var author    = db.escape((match[0]) ? match[0].trim() : '');
    var song_name = db.escape((match[1]) ? match[1].trim() : '');
    // console.log(song.meta);
    // console.log(song.meta.split('-'));
    queries.push(
      "UPDATE `"+BASE+"`.`"+DATE+"` SET author='"+author+"', song_name='"+song_name+
      "' WHERE id="+song.id+""
      );
  }
  // global.process.exit();
  console.log(queries);
  var insert = function(query, cb) { db.insert(query, function(err, res) { cb(err || null, null); }); };
  asc.ar_series(insert, queries, function(err, res) {
    console.log(err || res);
    cb_main(null, 'update_authorSong_name');
  });
}