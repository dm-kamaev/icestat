#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// Songs Ratio -> Days
// Считаем кол-во слушателей

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc');
var db    = require(CONF.my_modules + 'usedb.js');
var time  = require(CONF.my_modules + 'time.js');

var Playlists = require(CONF.oft_modules + 'Playlists.js');
var Stations  = require(CONF.oft_modules + 'Stations.js');


var express = require('express');
var router  = express.Router();
router.get('/', function(req, res, next) {
  // от клиента
  // { "mount":"/dor_64_no", "station":"dorognoe.hostingradio.ru", date: "2016-03-09" }

  var station = req.query.station;
  var mount   = req.query.mount;
  var date    = req.query.date; // TODO: Проверить формат времени
  // console.log(station, mount, date);

  // start("dorognoe.hostingradio.ru", "/dor_64_no", "2016-03-09", function(err, result) {
  start(station, mount, date, function(err, result) {
    if (err) {
      err.status = 404; next(err);
    } else {
      res.json(result);
    }
  });
});
// module.exports = router;
exports.router = router;

// test_start();

// ---------------------------------------------------------------------------------------------------
function start (station, stream, date, ext_cb) {
  console.time('Time');
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  CONTEXT.set('station', station);
  CONTEXT.set('stream',  stream);
  CONTEXT.set('date',    date);
  asc.series_move_data([
    (cbm) => { playlist_get_exist_tables(CONTEXT, cbm); },
    (cbm) => { stations_get_exist_tables(CONTEXT, cbm); },
    (cbm) => { get_data_from_playlist(CONTEXT, cbm); },
    (cbm) => { get_data_from_stations(CONTEXT, cbm); },
    (cbm) => { cbm(null, calc_listeners_startSong_after15s(CONTEXT), 'calc_listeners_startSong_after15s'); },
    (cbm, data) => { CONTEXT.set('result', group_by_hours(data)); cbm(null, 'group_by_hours');},
    ],function(err, result) {
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      console.log('\n\n async API_SONGS_RATIO_DAYS.JS series dine: ', err || result);
      console.timeEnd('Time');
      ext_cb(err || null, CONTEXT.get('result'));
  });
}
// ---------------------------------------------------------------------------------------------------


// { '2015-12-31': 0, '2016-01-01': 1, ... }
function playlist_get_exist_tables (CONTEXT, cb_main) {
  Playlists.get_exist_tables(CONTEXT.get('station'), function(err, res) {
    if (!err) { CONTEXT.set('playlist_exist_tables', res); }
      cb_main(err || null, 'Playlists.get_exist_tables');
  });
}
exports.playlist_get_exist_tables = playlist_get_exist_tables;


// { '2015-12-31': 0, '2016-01-01': 1, ... }
function stations_get_exist_tables (CONTEXT, cb_main) {
  Stations.get_exist_tables(CONTEXT.get('station'), function(err, res) {
    if (!err) { CONTEXT.set('stations_exist_tables', res); }
      cb_main(err || null, 'Playlists.get_exist_tables');
  });
}
exports.stations_get_exist_tables = stations_get_exist_tables;


/*[
  { date: Wed Mar 09 2016 23:56:00 GMT+0300 (MSK), mount: '/dor_64_no', count: 484, meta: 'BELINDA CARLISLE CIRCLE IN THE SAND' },
  { date: Wed Mar 09 2016 23:59:25 GMT+0300 (MSK), mount: '/dor_64_no', count: 485, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
]*/
function get_data_from_playlist (CONTEXT, cb_main) {
  var date = CONTEXT.get('date');
  if (CONTEXT.get('playlist_exist_tables')[date]) {
    var query = "SELECT date, mount, meta FROM `playlist_"+CONTEXT.get('station')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"'";
    db.read(query, function(err, res) {
      if (!err) { CONTEXT.set('playlist_data_from_base', prepare_data_for_playlist(res)); }
      cb_main(err || null, 'get_data_from_playlist');
    });
  } else {
    console.log('Warning: Не существует таблицы из playlist_'+CONTEXT.get('station')+' с такой датой => '+date);
    CONTEXT.set('playlist_data_from_base', []);
    cb_main(null, 'get_data_from_playlist');
  }
}
exports.get_data_from_playlist = get_data_from_playlist;


// data ––
/*[
  { date: Wed Mar 09 2016 23:56:00 GMT+0300 (MSK), mount: '/dor_64_no', count: 484, meta: 'BELINDA CARLISLE CIRCLE IN THE SAND' },
  { date: Wed Mar 09 2016 23:59:25 GMT+0300 (MSK), mount: '/dor_64_no', count: 485, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
]*/
// return ––
/*[
  { start_song_ms: 1457556960000, after_15s_ms: 1457556975000, meta: 'BELINDA CARLISLE CIRCLE IN THE SAND', count: 484 },
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК', count: 485 }
]*/
function prepare_data_for_playlist (data_from_base) {
  var res = [];
  for (var i = 0, l = data_from_base.length; i < l; i++) {
    var song         = data_from_base[i],
        date         = time.get(song.date),
        start_song_s = date.in_s,
        after_15s_s  = start_song_s + 15; // получаем время: 15 секунд после начала песни

    var after_15s_ms  = after_15s_s * 1000;
    after_15s_ms      = (date.day === time.get(after_15s_ms).day) ? after_15s_ms : null;

    res.push({
      start_song_ms : date.in_ms,
      after_15s_ms  : after_15s_ms,
      // start_song_ms : new Date(date.in_ms),
      // after_15s_ms  : new Date(after_15s_ms),
      meta          : song.meta,
      // count         : song.count,
      mount         : song.mount,
    });
  }
  // console.log(res)
  // global.process.exit();
  return res;
}


/*[
  { date: Wed Mar 09 2016 23:56:00 GMT+0300 (MSK), mount: '/dor_64_no', count: 484, meta: 'BELINDA CARLISLE CIRCLE IN THE SAND' },
  { date: Wed Mar 09 2016 23:59:25 GMT+0300 (MSK), mount: '/dor_64_no', count: 485, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
]*/
function get_data_from_stations (CONTEXT, cb_main) {
  var date = CONTEXT.get('date');
  if (CONTEXT.get('stations_exist_tables')[date]) {
    var query = "SELECT UNIX_TIMESTAMP(date) as end_listen_s, mount, duration FROM `stations_"+CONTEXT.get('station')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"' ORDER BY end_listen_s ASC";
    db.read(query, function(err, res) {
      if (!err) { CONTEXT.set('stations_data_from_base', prepare_data_for_stations(res)); }
      cb_main(err || null, 'get_data_from_stations');
    });
  } else {
    console.log('Warning: Не существует таблицы из stations_'+CONTEXT.get('station')+' с такой датой => '+date);
    CONTEXT.set('data_from_base', []);
    cb_main(null, 'get_data_from_stations');
  }
}
exports.get_data_from_stations = get_data_from_stations;


/* data_from_base ––
[
 { start_listen_s: 1457531591, mount: '/dor_64_no', duration: 29211 },
 { start_listen_s: 1457531592, mount: '/dor_64_no', duration: 3218 }
]
return ––
[ { start_listen_ms: 1457531596000, end_listen_ms: 1457564324000, mount: '/dor_64_no', duration_ms: 32728000 },
  { start_listen_ms: 1457531598000, end_listen_ms: 1457531610000, mount: '/dor_64_no', duration_ms: 12000 }
]*/
function prepare_data_for_stations (data_from_base) {
  var res = [];
  for (var i = 0, l = data_from_base.length; i < l; i++) {
    var connect         = data_from_base[i];
    var end_listen_ms   = connect.end_listen_s * 1000;
    var duration_ms     = connect.duration * 1000;
    var start_listen_ms = end_listen_ms - duration_ms;
    res.push({
      start_listen_ms: start_listen_ms,
      end_listen_ms  : end_listen_ms,
      // start_listen_ms: new Date(start_listen_ms),
      // end_listen_ms  : new Date(end_listen_ms),
      mount          : connect.mount,
      duration_ms    : duration_ms,
    });
  }
  // console.log(res);
  // global.process.exit();
  return res;
}


// Вычисляем кол-во слушателей на начало песни и через 15 секунд после начала
/*
playlist_data_from_base ––
[
  { start_song_ms: 1457556960000, after_15s_ms: 1457556975000, meta: 'BELINDA CARLISLE CIRCLE IN THE SAND', count: 484 },
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК', count: 485 }
]
stations_data_from_base ––
[
  { start_listen_ms: 1457531596000, end_listen_ms: 1457564324000, mount: '/dor_64_no', duration_ms: 32728000 },
  { start_listen_ms: 1457531598000, end_listen_ms: 1457531610000, mount: '/dor_64_no', duration_ms: 12000 }
]
return ––
[
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, value_listeners_start_song: 6, value_listeners_after_15s: 6, ratio: 0, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, value_listeners_start_song: 6, value_listeners_after_15s: 6, ratio: 0, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
]
*/
function calc_listeners_startSong_after15s (CONTEXT) {
  var res           = [],
      playlist_data = CONTEXT.get('playlist_data_from_base'),
      stations_data = CONTEXT.get('stations_data_from_base');

  for (var i = 0, l = playlist_data.length; i < l; i++) {
    var song                       = playlist_data[i],
        value_listeners_start_song = 0,
        value_listeners_after_15s  = 0;
    // for (var l1 = stations_data.length - 1, j = l1; j >= 0; j--) {
    for (var l1 = (stations_data || []).length - 1, j = l1; j >= 0; j--) {
      var connect = stations_data[j];
      if (connect.end_listen_ms < song.start_song_ms && connect.end_listen_ms < song.after_15s_ms) { break; }
      if (
          connect.start_listen_ms <= song.start_song_ms &&
          connect.end_listen_ms   >= song.start_song_ms
         ) { value_listeners_start_song++; }
      if (
        connect.start_listen_ms <= song.after_15s_ms &&
        connect.end_listen_ms   >= song.after_15s_ms
      ) { value_listeners_after_15s++; }
    }
    res.push({
      start_song_ms           : song.start_song_ms,
      after_15s_ms            : song.after_15s_ms,
      // start_song_ms              : new Date(song.start_song_ms),
      // after_15s_ms               : new Date(song.after_15s_ms),
      value_listeners_start_song : value_listeners_start_song,
      value_listeners_after_15s  : value_listeners_after_15s,
      ratio                      : value_listeners_after_15s - value_listeners_start_song,
      meta                       : song.meta,
    });
  }
  // console.log(res);
  return res;
}
exports.calc_listeners_startSong_after15s = calc_listeners_startSong_after15s;


// сгруппировали по часам
/*
data ––
[
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, value_listeners_start_song: 6, value_listeners_after_15s: 6, ratio: 0, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, value_listeners_start_song: 6, value_listeners_after_15s: 6, ratio: 0, meta: 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК' },
]
return ––
{ songs_ratio_days_23:
  [ { start_song_ms: Wed Mar 09 2016 23:01:54 GMT+0300 (MSK), after_15s_ms: Wed Mar 09 2016 23:02:09 GMT+0300 (MSK), value_listeners_start_song: 266, value_listeners_after_15s: 260, ratio: -6, meta: 'СТАС ПЬЕХА И ЛАЙМА ВАЙКУЛЕ Я ЗАКРЫВАЮ ГЛАЗА' },
    { start_song_ms: Wed Mar 09 2016 23:05:32 GMT+0300 (MSK), after_15s_ms: Wed Mar 09 2016 23:05:47 GMT+0300 (MSK), value_listeners_start_song: 250, value_listeners_after_15s: 248, ratio: -2, meta: 'ПЛАМЯ НЕ ПОВТОРЯЕТСЯ ТАКОЕ НИКОГДА' }
  ]
}*/
function group_by_hours (songs) {
  var res        = {};
  for (var i = 0, l = songs.length; i < l; i++) {
    var song = songs[i],
        hour = time.get(song.start_song_ms).double_hour,
        key  = 'songs_ratio_days_'+hour;
    if (!res[key]) { res[key] = [];}
    res[key].push(song);
  }
  return res;
}





function test_start () {
  // { "mount":"/dor_64_no", "station":"dorognoe.hostingradio.ru", date: "2016-03-09" }
  // start(
  //   'blackstarradio.hostingradio.ru',
  //   '/blackstarradio128.mp3',
  //   '2016-03-20',
  //   function(err, result) {
  //     // console.log(result.group_by_hours, result.list_hours);
  //     console.log('That\'s all');
  //     // test_start();
  //   }
  // );
  start(
    'dorognoe.hostingradio.ru',
    '/dor_64_no',
    '2016-03-09',
    function(err, result) {
      console.log(result);
      console.log('That\'s all');
      // test_start();
    }
  );
}