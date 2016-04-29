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


// get_list_tables_stations('playlist_dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
exports.get_list_tables_stations = function (database, callback) {
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
};


// из базы с префиксом stations_* вытащить список таблиц
// { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10,}
exports.in_stations = function (CONTEXT, callback) {
  exports.get_list_tables_stations(CONTEXT.get('database'), function(err, res) {
    if (!err) { CONTEXT.set('in_stations', res); }
    callback(err || null, 'Get_exist_tb.in_stations');
  });
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({database: 'xmusicradio.hostingradio.ru'});
// exports.in_stations(CONTEXT, function(err, res) {console.log(CONTEXT.get('in_stations'));});


// get_list_tables_playlist('dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
exports.get_list_tables_playlist = function (database, callback) {
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
};


// из базы с префиксом playlist_* вытащить список таблиц
// { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10,}
exports.in_playlist = function (CONTEXT, callback) {
  exports.get_list_tables_playlist(CONTEXT.get('database'), function(err, res) {
    if (!err) { CONTEXT.set('in_playlist', res); }
    callback(err || null, 'Get_exist_tb.in_playlist');
  });
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({database: 'xmusicradio.hostingradio.ru'});
// exports.in_playlist(CONTEXT, function(err, res) {console.log(CONTEXT.get('in_playlist'));});// из базы с префикосм playlist_* вытащить список таблиц


// any_table('stations_dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
exports.get_list_tables = function  (database, callback) {
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
};


// из любой указанной базы вытащить список таблиц
// { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10,}
exports.in_db = function (CONTEXT, callback) {
  exports.get_list_tables(CONTEXT.get('database'), function(err, res) {
    if (!err) { CONTEXT.set('in_db', res); }
    callback(err || null, 'Get_exist_tb.in_db');
  });
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({database: 'playlist_xmusicradio.hostingradio.ru'});
// exports.in_db(CONTEXT, function(err, res) {console.log(CONTEXT.get('in_db'));});





