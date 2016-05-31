#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// Songs Ratio -> Days
// ВЫВОДИМ СПИСОК ПЕСНЕЙ ЗА ДЕНЬ C ГРУППИРОВКОЙ ПО ЧАСАМ,
// ДЛЯ КАЖДОЙ ПЕСНИ СЧИТАЕМ КОЛ-ВО СЛУШАТЕЛЕЙ НА НАЧАЛО И ЧЕРЕЗ 15с, ПОСЛЕ НАЧАЛА
// СЧИТАЕМ МЕЖДУ ЭТИМИ ДВУМЯ ВЕЛИЧИНАМИ ТЕМП ПРИРОСТА В %

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc');
var db    = require(CONF.my_modules + 'usedb.js');
var time  = require(CONF.my_modules + 'time.js');

var check_range_date = require(CONF.oft_modules + 'check_range_date.js');
var Get_exist_tb     = require(CONF.oft_modules + 'Get_exist_tb.js');

var MAX_DAY = 200; // максимальный диапазон в между начальной и конечной датой

var express = require('express');
var router  = express.Router();
router.get('/', function(req, res, next) {
  // от клиента
  // { "db":"dorognoe.hostingradio.ru", "stream":"/dor_64_no", date: "2016-03-09" }
  // console.log(req.query);
  var db_mount  = JSON.parse(req.query.db_mount);
  var start_date = req.query.start_date;
  var end_date   = req.query.end_date;  // TODO: Проверить формат времени
  // console.log(db_mount, start_date, end_date);
  start(db_mount, start_date, end_date, function(err, result) {
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
function start (db_mount, start_date, end_date, ext_cb) {
  console.log(time.format('Дата: YYYY-MM-DD hh:mm', time.get()));
  console.time('Time');
  // end_result ––  хэш, куда будем складывать все данные
  var info = { start_date: start_date, end_date: end_date, end_result: {} };
  asc.map_seriesParam(for_each_station, db_mount, info, function(err, res) {
    console.timeEnd('Time');
    ext_cb(err || null, info.end_result);
  });
}


function for_each_station (radio, info, callback) {
  console.time('one_station');
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  CONTEXT.set('database',   radio.db);
  CONTEXT.set('stream',     radio.stream);
  CONTEXT.set('start_date', info.start_date);
  CONTEXT.set('end_date',   info.end_date);
  CONTEXT.set('end_result', info.end_result);
  // console.log(radio.db, radio.stream, info.start_date, info.end_date);
  asc.waterfall([
    (cbm) => { Get_exist_tb.in_playlist(CONTEXT, cbm); },
    (cbm) => { Get_exist_tb.in_stations(CONTEXT, cbm); },
    (cbm) => { cbm(null, check_range_date.in_playlist(CONTEXT, MAX_DAY), 'check_range_date.in_playlist'); },
    (cbm, range_date_in_playlist) => { get_data_from_base(CONTEXT, range_date_in_playlist, cbm); },
    ],function(err, result) {
      // console.log(CONTEXT.get('in_stations'));
      // console.log(CONTEXT.get('in_playlist'));
      // console.log(CONTEXT.get('range_date_in_playlist'));
      var who = 'radio = '+radio.db+', stream = '+radio.stream;
      console.log('\n\n async API_SONGS_RATIO_SONGS.JS series dine: '+who, err || result);
      console.timeEnd('one_station');
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      callback(err || null, 'for_each_station');
  });
}
// ---------------------------------------------------------------------------------------------------


// range_date – [ '2016-05-17', '2016-05-18' ]
function get_data_from_base (CONTEXT, range_date, cb_main) {
  var queries_date = [];
  for (var i = 0, l = range_date.length; i < l; i++) {
    var date = range_date[i];
    if (CONTEXT.get('in_playlist')[date] && CONTEXT.get('in_stations')[date]) {
      queries_date.push([
        "SELECT date, author, song_name FROM `playlist_"+CONTEXT.get('database')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"'",
        "SELECT UNIX_TIMESTAMP(date) as end_listen_s, mount, duration FROM `stations_"+CONTEXT.get('database')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"' ORDER BY end_listen_s ASC",
        date
      ]);
    } else {
      if (!CONTEXT.get('in_playlist')[date]) { console.log('Warning: Не существует таблицы из playlist_'+CONTEXT.get('database')+' с такой датой => '+date); }
      if (!CONTEXT.get('in_stations')[date]) { console.log('Warning: Не существует таблицы из stations_'+CONTEXT.get('station')+' с такой датой => '+date); }
    }
  }
  var read = function(queries_date, cb) {
    var query_playlist = queries_date[0], query_stations = queries_date[1], given_date = queries_date[2];
    asc.series([
      (cbm)=>{ db.read(query_playlist, function(err, res) { cbm(err || null, res || null); }); },
      (cbm)=>{ db.read(query_stations, function(err, res) { cbm(err || null, res || null); }); },
    ], function(err, from_base) {
      // if (!err) { console.log(res); }
      if (!err) { prepare_data(CONTEXT, given_date, from_base); }
      cb(err || null, null);
    });
  };
  asc.map_series(read, queries_date, function(err, res) {
    // console.log(CONTEXT.get('data_from_playlist')['Скруджи::::Ровной Дороги'])
    cb_main(err || null, 'get_data_from_base');
  });
}


// Вычисляем кол-во слушателей песни на начало и через 15с, а так же их отношение
// набиваем в хэш end_result
// from_playlist –– [ { date: Sat Apr 23 2016 23:00:20 GMT+0300 (MSK), author: 'Michael Woods', song_name: 'Easy Tiger' }, ... ]
// from_stations –– [ { end_listen_s: 1461445199, mount: '/blackstarradio128.mp3', duration: 8 }, { end_listen_s: 1461445199, mount: '/blackstarradio128.mp3', duration: 15 }, ... ]
// given_date –– { '00': [ { date: Wed May 18 2016 00:03:09 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO', value_listeners_start_song: 690, value_listeners_after_15s: 695, ratio: 5 }, { date: Wed May 18 2016 00:03:17 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO',  value_listeners_start_song: 694, value_listeners_after_15s: 693, ratio: -1 },
//                 '01': [ { date: Wed May 18 2016 00:03:09 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO', value_listeners_start_song: 690, value_listeners_after_15s: 695, ratio: 5 }, { date: Wed May 18 2016 00:03:17 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO',  value_listeners_start_song: 694, value_listeners_after_15s: 693, ratio: -1 },
//               }
// end_result ––  { 'dorognoe.hostingradio.ru::::/dor_64_no::::2016-05-16': given_date, 'ep256.hostingradio.ru::::/europaplus256.mp3::::2016-05-16',: given_date }
function prepare_data (CONTEXT, selected_date, from_base) {
  var from_playlist = from_base[0], from_stations = from_base[1], end_result = CONTEXT.get('end_result');
  end_result[CONTEXT.get('database')+'::::'+CONTEXT.get('stream')+'::::'+selected_date] = {};
  var given_date = end_result[CONTEXT.get('database')+'::::'+CONTEXT.get('stream')+'::::'+selected_date];
  for (var i = 0, l = from_playlist.length; i < l; i++) {
    var song          = from_playlist[i],
        date          = time.get(song.date),
        start_song_s  = date.in_s,
        after_15s_s   = start_song_s + 15, // получаем время: 15 секунд после начала песни
        start_song_ms = start_song_s * 1000;

    var after_15s_ms  = after_15s_s * 1000;
    after_15s_ms      = (date.day === time.get(after_15s_ms).day) ? after_15s_ms : null;
    var value_listeners_start_song = 0, value_listeners_after_15s = 0;
    for (var j = (from_stations || []).length - 1; j >= 0; j--) {
      var connect         = from_stations[j],
          end_listen_ms   = connect.end_listen_s * 1000,
          duration_ms     = connect.duration * 1000,
          start_listen_ms = end_listen_ms - duration_ms;
      if (end_listen_ms < start_song_ms && end_listen_ms < after_15s_ms) { break; }
      if (
          start_listen_ms <= start_song_ms &&
          end_listen_ms   >= start_song_ms &&
          // time.get(start_listen_ms).day >= time.get(song.start_song_ms).day && // защита от того, что песня начилась в этих сутках, а закончилась в следующих или предыдущих
          time.get(end_listen_ms).day   <= time.get(start_song_ms).day
         )
        {
          // if (song.author === 'Скруджи' && song.song_name === 'Ровной Дороги') {
          /*if (authorSong_name === 'Скруджи::::Ровной Дороги') {
            console.log(authorSong_name);
            console.log(new Date(connect.start_listen_ms), new Date(song.start_song_ms), new Date(connect.end_listen_ms))
            console.log(playlist_data[authorSong_name].value_listeners_start_song)
          }*/
          value_listeners_start_song++;
        }
      // if (start_listen_ms <= song.after_15s_ms && end_listen_ms >= song.after_15s_ms) {
      if (start_listen_ms <= after_15s_ms && end_listen_ms >= after_15s_ms) {
        value_listeners_after_15s++;
      }
    }
    if (!given_date[date.double_hour]) { given_date[date.double_hour] = []; }
    given_date[date.double_hour].push({
      date                      : song.date,
      author                    : song.author,
      song_name                 : song.song_name,
      value_listeners_start_song: value_listeners_start_song,
      value_listeners_after_15s : value_listeners_after_15s,
      ratio                     : value_listeners_after_15s - value_listeners_start_song,
    });
  }
  // console.log(given_date);
  // console.log(Object.keys(end_result));
}


function test_start () {
  start(
    [
      // { db: 'blackstarradio.hostingradio.ru',  stream: '/blackstarradio128.mp3' },
      // { db: 'dorognoe.hostingradio.ru',  stream: '/dor_64_no' },
      { db: 'ep256.hostingradio.ru', stream: '/europaplus256.mp3'},
    ],
    // '2016-03-22',
    // '2016-03-22',
    '2016-05-18',
    '2016-05-18',
    function(err, result) {
      // console.log(result);
      console.log('That\'s all');
      // test_start();
    }
  );
}




function OLD_CODE () {

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
}






