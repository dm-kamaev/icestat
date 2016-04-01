#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// ПРОВЕРЯЕМ СУЩЕСТВОВАНИЕ ТАБЛИЦЫ НА КОНКРЕТНУЮ ДАТУ В stations_* или playlist_*

"use strict";

var db = require('/icestat/my/usedb.js');



// stations('playlist_dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
function stations (database, callback) {
  db.read("SHOW TABLES IN `stations_"+database+"`", function(err, res) {
    var Tables = {};
    if (!err) {
      for (var k = 0, L = res.length; k < L; k++) {
        var rd = res[k];
        Tables[rd['Tables_in_stations_'+database]] = k;
      }
    }
    callback(err || null, Tables || null);
  });
}
exports.stations = stations;


// playlist('dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
function playlist (database, callback) {
  var query = "SHOW TABLES IN `playlist_"+database+"`";
  // console.log(query);
  db.read(query, function(err, res) {
    var Tables = {};
    if (!err) {
      for (var k = 0, L = res.length; k < L; k++) {
        var rd = res[k];
        Tables[rd['Tables_in_playlist_'+database]] = k;
      }
    }
    callback(err || null, Tables || null);
  });
}
exports.playlist = playlist;


// any_table('stations_dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
function any_tables (database, callback) {
  var query = "SHOW TABLES IN `"+database+"`";
  // console.log(query);
  db.read(query, function(err, res) {
    var Tables = {};
    if (!err) {
      for (var k = 0, L = res.length; k < L; k++) {
        var rd = res[k];
        Tables[rd['Tables_in_'+database]] = k;
      }
    }
    callback(err || null, Tables || null);
  });
}
exports.any_tables = any_tables;







