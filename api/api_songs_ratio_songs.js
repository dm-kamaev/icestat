#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// СЧИТАЕМ КОЛ-ВО ПОЛЬЗОВАТЕЛЕЙ ДЛЯ КАЖДОЙ ПЕСНИ НА НАЧАЛО И ЧЕРЕЗ 15 СЕКУНД,
// А ТАК ЖЕ СКОЛЬКО РАЗ ОНА ИГРАЛА ЗА ДЕНЬ

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc');
var db    = require(CONF.my_modules + 'usedb.js');
var sort  = require(CONF.my_modules + 'sort.js');

var api_songs_ratio_days = require(CONF.api_modules + 'api_songs_ratio_days.js');

// test_start();

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
exports.router = router;


// ---------------------------------------------------------------------------------------------------
function start (station, stream, date, ext_cb) {
  console.time('Time');
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  CONTEXT.set('station', station);
  CONTEXT.set('stream',  stream);
  CONTEXT.set('date',    date);
  asc.series_move_data([
    (cbm) => { api_songs_ratio_days.playlist_get_exist_tables(CONTEXT, cbm); },
    (cbm) => { api_songs_ratio_days.stations_get_exist_tables(CONTEXT, cbm); },
    (cbm) => { api_songs_ratio_days.get_data_from_playlist(CONTEXT, cbm); },
    (cbm) => { api_songs_ratio_days.get_data_from_stations(CONTEXT, cbm); },
    (cbm) => { cbm(null, api_songs_ratio_days.calc_listeners_startSong_after15s(CONTEXT), 'calc_listeners_startSong_after15s'); },
    (cbm, data) => { CONTEXT.set('data', calc_total_and_ratio(data)), cbm(null, 'calc_total_and_ratio'); },
    (cbm) => { CONTEXT.set('order_songs', get_order_songs(CONTEXT.get('data'))),     cbm(null, 'get_order_songs'); },
    ],function(err, result) {
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      console.log('\n\n async API_SONGS_RATIO_SONGS.JS series dine: ', err || result);
      console.timeEnd('Time');
      ext_cb(err || null, { data: CONTEXT.get('data'), order_songs: CONTEXT.get('order_songs') });
  });
}
// ---------------------------------------------------------------------------------------------------


/* playlist_data_from_base ––
[
  { start_song_ms: 1457556960000, after_15s_ms: 1457556975000, value_listeners_start_song: 22, value_listeners_after_15s: 23, ratio: 1, meta: "BELINDA CARLISLE CIRCLE IN THE SAND"},
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, value_listeners_start_song: 6,  value_listeners_after_15s: 6,  ratio:0,  meta:"'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК"}
]
return ––
{ 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК':
  { value_play: 1, total_value_listeners_start_song: 6, total_value_listeners_after_15s: 6, ratio_percent: '0.00' },
  { value_play: 1, total_value_listeners_start_song: 22,total_value_listeners_after_15s: 23,ratio_percent: '4.55' },
}
*/
function calc_total_and_ratio (playlist_data_from_base) {
  var res            = {};
  for (var i = 0, l = playlist_data_from_base.length; i < l; i++) {
    var song = playlist_data_from_base[i],
        key  = song.meta;
    if (!res[key]) {
      res[key] = {
        value_play                       : 0,
        total_value_listeners_start_song : 0,
        total_value_listeners_after_15s  : 0,
        ratio_percent                    : 0,
      };
    }
    res[key].value_play++;
    res[key].total_value_listeners_start_song += song.value_listeners_start_song;
    // if (key === 'АНЖЕЛИКА ВАРУ') { console.log('after 15c ADD in', res[key].total_value_listeners_after_15s, ' + ',  song.value_listeners_after_15s) }
    res[key].total_value_listeners_after_15s  += song.value_listeners_after_15s;
    // Эта формула эквивалента формуле ниже: вычиатем 100 как бы принимая предыдущие значение за 100
    // , но как вывести алгебраически не могу. Сделать позже
    // res[key].ratio_percent                    =  (res[key].total_value_listeners_after_15s / res[key].total_value_listeners_start_song * 100 - 100).toFixed(2);
    res[key].ratio_percent                    =  ((res[key].total_value_listeners_after_15s - res[key].total_value_listeners_start_song) / res[key].total_value_listeners_start_song * 100).toFixed(2);
  }
  // console.log(res);
  return res;
}


// сортируем песни в порядке выдачи
/* songs ––
{ 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК':
  { value_play: 1, total_value_listeners_start_song: 6, total_value_listeners_after_15s: 6, ratio_percent: '0.00' },
  { value_play: 1, total_value_listeners_start_song: 22,total_value_listeners_after_15s: 23,ratio_percent: '4.55' },
}
return –– [ [ 'АНЖЕЛИКА ВАРУ', 3 ], [ 'ЛЕСОПОВАЛ Я КУПЛЮ ТЕБЕ ДОМ', 2 ], [ 'НИКОЛАЙ БАСКОВ ЛЮБОВЬ - НЕ СЛОВА', 2 ], ]
*/
function get_order_songs (songs) {
  var songs_name     = Object.keys(songs),
      songs_top_list = [];
  for (var i = 0, l = songs_name.length; i < l; i++) {
    var song_name = songs_name[i];
    songs_top_list.push([song_name, songs[song_name].value_play]);
  }
  songs_top_list.sort(sort.compare_dig_array_index('asc', 1));
  // console.log(songs_top_list);
  return songs_top_list;
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
