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
var time  = require(CONF.my_modules + 'time.js');
var sort  = require(CONF.my_modules + 'sort.js');

var api_songs_ratio_days = require(CONF.api_modules + 'api_songs_ratio_days.js');

var Get_exist_tb     = require(CONF.oft_modules + 'Get_exist_tb.js');
var check_range_date = require(CONF.oft_modules + 'check_range_date.js');


var MAX_DAY = 200; // максимальный диапазон в между начальной и конечной датой

// test_start();

var express = require('express');
var router  = express.Router();
router.get('/', function(req, res, next) {
  // от клиента
  // { "mount":"/dor_64_no", "station":"dorognoe.hostingradio.ru", date: "2016-03-09" }
  var db_mount   = JSON.parse(req.query.db_mount);
  var start_date = req.query.start_date;
  var end_date   = req.query.end_date;  // TODO: Проверить формат времени

  start(db_mount, start_date, end_date, function(err, result) {
    if (err) {
      err.status = 404; next(err);
    } else {
      res.json(result);
    }
  });
});
exports.router = router;


// ---------------------------------------------------------------------------------------------------
function start (db_mount, start_date, end_date, ext_cb) {
  console.time('Time');
  // end_result ––  хэш, куда будем складывать все данные
  var info = { start_date: start_date, end_date: end_date, end_result: {} };
  asc.ar_series_with_params(for_each_station, db_mount, info, function(err, res) {
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
  asc.series_move_data([
    (cbm) => { Get_exist_tb.in_playlist(CONTEXT, cbm); },
    (cbm) => { Get_exist_tb.in_stations(CONTEXT, cbm); },
    (cbm) => { cbm(null, check_range_date.in_playlist(CONTEXT, MAX_DAY), 'check_range_date.in_playlist'); },
    (cbm, range_date_in_playlist) => { get_data_from_playlist(CONTEXT, range_date_in_playlist, cbm); },
    (cbm) => { cbm(null, check_range_date.in_stations(CONTEXT, MAX_DAY), 'check_range_date.in_stations'); },
    (cbm, range_date_in_stations) => { get_data_from_stations(CONTEXT, range_date_in_stations, cbm); },
    (cbm) => { cbm(null, calc_listeners_startSong_after15s(CONTEXT), 'calc_listeners_startSong_after15s'); },
    (cbm, val_listeners_startSong_after15s) => { CONTEXT.set('data', calc_total_and_ratio(val_listeners_startSong_after15s)), cbm(null, 'calc_total_and_ratio'); },
    (cbm) => { CONTEXT.set('order_songs', get_order_songs(CONTEXT.get('data'))), cbm(null, 'get_order_songs'); },
    ],function(err, result) {
      // console.log(CONTEXT.get('in_stations'));
      // console.log(CONTEXT.get('in_playlist'));
      // console.log(CONTEXT.get('range_date_in_playlist'));
      info.end_result = { data: CONTEXT.get('data'), order_songs: CONTEXT.get('order_songs') };
      // console.log(info.end_result);
      // console.log(info.order_songs);
      var who = 'radio = '+radio.db+', stream = '+radio.stream;
      console.log('\n\n async API_SONGS_RATIO_SONGS.JS series dine: '+who, err || result);
      console.timeEnd('one_station');
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      callback(err || null, 'for_each_station');
  });
}
// ---------------------------------------------------------------------------------------------------


// range_date –
function get_data_from_playlist (CONTEXT, range_date, cb_main) {
  var queries = [];
  CONTEXT.set('data_from_playlist', []);
  for (var i = 0, l = range_date.length; i < l; i++) {
    var date = range_date[i];
    if (CONTEXT.get('in_playlist')[date]) {
      queries.push("SELECT date, mount, author, song_name FROM `playlist_"+CONTEXT.get('database')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"'");
    } else {
      console.log('Warning: Не существует таблицы из playlist_'+CONTEXT.get('database')+' с такой датой => '+date);
    }
  }
  var read = function(query, cb) {
    db.read(query, function(err, res) {
      if (!err) { prepare_data_for_playlist(CONTEXT, res); }
      cb(err || null, null);
    });
  };
  asc.ar_series(read, queries, function(err, res) {
    // if (!err) { console.log(CONTEXT.get('data_from_playlist'));  }
    cb_main(err || null, 'get_data_from_playlist');
  });
}


// data –– [{ date: Sat Apr 23 2016 19:22:03 GMT+0300 (MSK), mount: '/blackstarradio128.mp3', author: 'Мот', song_name: 'Понедельник вторник' }, ]
// data_from_playlist –– [ { start_song_ms: Sat Apr 23 2016 23:00:20 GMT+0300 (MSK), after_15s_ms: Sat Apr 23 2016 23:00:35 GMT+0300 (MSK), author: 'Michael Woods', song_name: 'Easy Tiger', mount: '/blackstarradio128.mp3' }, ]
function prepare_data_for_playlist (CONTEXT, data) {
  for (var i = 0, l = data.length; i < l; i++) {
    var song         = data[i],
        date         = time.get(song.date),
        start_song_s = date.in_s,
        after_15s_s  = start_song_s + 15; // получаем время: 15 секунд после начала песни

    var after_15s_ms  = after_15s_s * 1000;
    after_15s_ms      = (date.day === time.get(after_15s_ms).day) ? after_15s_ms : null;
    CONTEXT.get('data_from_playlist').push({
      start_song_ms : date.in_ms,
      after_15s_ms  : after_15s_ms,
      // date          : song.date,
      // start_song_ms : new Date(date.in_ms),
      // after_15s_ms  : new Date(after_15s_ms),
      author        : song.author,
      song_name     : song.song_name,
      mount         : song.mount,
    });
  }
}


// range_date –
function get_data_from_stations (CONTEXT, range_date, cb_main) {
  var queries = [];
  CONTEXT.set('data_from_stations', []);

  for (var i = 0, l = range_date.length; i < l; i++) {
    var date = range_date[i];
    if (CONTEXT.get('in_stations')[date]) {
      queries.push("SELECT UNIX_TIMESTAMP(date) as end_listen_s, mount, duration FROM `stations_"+CONTEXT.get('database')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"' ORDER BY end_listen_s ASC");
    } else {
      console.log('Warning: Не существует таблицы из stations_'+CONTEXT.get('station')+' с такой датой => '+date);
    }
  }
  var read = function(query, cb) {
    db.read(query, function(err, res) {
      if (!err) { prepare_data_for_stations(CONTEXT, res); }
      cb(err || null, null);
    });
  };
  asc.ar_series(read, queries, function(err, res) {
    // if (!err) { console.log(CONTEXT.get('data_from_stations'));  }
    cb_main(err || null, 'get_data_from_stations');
  });
}


// data               –– [ { end_listen_s: 1461445199, mount: '/blackstarradio128.mp3', duration: 15 }, ... ]
// data_from_stations –– [ { start_listen_ms: Sat Apr 23 2016 10:10:15 GMT+0300 (MSK), end_listen_ms: Sat Apr 23 2016 10:10:32 GMT+0300 (MSK),  mount: '/blackstarradio128.mp3', duration_ms: 17000 }, ]
function prepare_data_for_stations (CONTEXT, data) {
  for (var i = 0, l = data.length; i < l; i++) {
    var connect         = data[i],
        end_listen_ms   = connect.end_listen_s * 1000,
        duration_ms     = connect.duration * 1000,
        start_listen_ms = end_listen_ms - duration_ms;
    CONTEXT.get('data_from_stations').push({
      start_listen_ms: start_listen_ms,
      end_listen_ms  : end_listen_ms,
      // start_listen_ms: new Date(start_listen_ms),
      // end_listen_ms  : new Date(end_listen_ms),
      mount          : connect.mount,
      duration_ms    : duration_ms,
    });
  }
}


// data_from_playlist –– [ { start_song_ms: Sat Apr 23 2016 23:00:20 GMT+0300 (MSK), after_15s_ms: Sat Apr 23 2016 23:00:35 GMT+0300 (MSK), author: 'Michael Woods', song_name: 'Easy Tiger', mount: '/blackstarradio128.mp3' }, ]
// data_from_stations –– [ { start_listen_ms: Sat Apr 23 2016 10:10:15 GMT+0300 (MSK), end_listen_ms: Sat Apr 23 2016 10:10:32 GMT+0300 (MSK),  mount: '/blackstarradio128.mp3', duration_ms: 17000 }, ]
// return –– [ { start_song_ms: Sat Apr 23 2016 00:10:37 GMT+0300 (MSK), after_15s_ms: Sat Apr 23 2016 00:10:52 GMT+0300 (MSK), value_listeners_start_song: 248, value_listeners_after_15s: 246, ratio: -2, author: 'Lost Frequencies', song_name: 'Are You With Me (Dash Berlin remix)' }, ... ]
function calc_listeners_startSong_after15s (CONTEXT) {
  var res           = [],
      playlist_data = CONTEXT.get('data_from_playlist'),
      stations_data = CONTEXT.get('data_from_stations');
    // console.log(stations_data); global.process.exit();
  for (var i = 0, l = playlist_data.length; i < l; i++) {
    var song                       = playlist_data[i],
        value_listeners_start_song = 0,
        value_listeners_after_15s  = 0;

    for (var j = (stations_data || []).length - 1; j >= 0; j--) {
      var connect = stations_data[j];
      if (connect.end_listen_ms < song.start_song_ms && connect.end_listen_ms < song.after_15s_ms) { break; }
      if (
          connect.start_listen_ms <= song.start_song_ms &&
          connect.end_listen_ms   >= song.start_song_ms &&
          // time.get(connect.start_listen_ms).day >= time.get(song.start_song_ms).day && // защита от того, что песня начилась в этих сутках, а закончилась в следующих или предыдущих
          time.get(connect.end_listen_ms).day   <= time.get(song.start_song_ms).day
         )
        {
          // if (song.author === 'Скруджи' && song.song_name === 'Ровной Дороги') {
          //   console.log(song.author, song.song_name);
          //   console.log(new Date(connect.start_listen_ms), new Date(song.start_song_ms), new Date(connect.end_listen_ms))
          //   console.log(value_listeners_start_song)
          // }
          value_listeners_start_song++;
        }
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
      author                     : song.author,
      song_name                  : song.song_name,
    });
  }
  console.log('HERE___')
  CONTEXT['data_from_playlist']=null;
  CONTEXT['data_from_stations']=null;
  // console.log(res);
  return res;
}


/* data_from_base_playlist ––
[
  { start_song_ms: 1457556960000, after_15s_ms: 1457556975000, value_listeners_start_song: 22, value_listeners_after_15s: 23, ratio:1, meta: "BELINDA CARLISLE CIRCLE IN THE SAND"},
  { start_song_ms: 1457557165000, after_15s_ms: 1457557180000, value_listeners_start_song: 6,  value_listeners_after_15s: 6,  ratio:0,  meta:"'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК"}
]
return ––
{ 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК':
  { value_play: 1, total_value_listeners_start_song: 6, total_value_listeners_after_15s: 6, ratio_percent: '0.00' },
  { value_play: 1, total_value_listeners_start_song: 22,total_value_listeners_after_15s: 23,ratio_percent: '4.55' },
}
*/
// TODO: Для ускорения работы прямо в data_from_playlist пробовать писать вычисления
// без создания нового объекта
function calc_total_and_ratio (data_from_base_playlist) {
  var res            = {};
  var sum = 0;
  for (var i = 0, l = data_from_base_playlist.length; i < l; i++) {
    var song = data_from_base_playlist[i],
        key  = song.author+'::::'+song.song_name;
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
    // if (song.author === 'Скруджи' && song.song_name === 'Ровной Дороги') { console.log(song); }
    // if (key === 'Скруджи::::Ровной Дороги') {
    //   console.log(key, new Date(song.start_song_ms), song.value_listeners_start_song);
    //   sum+=song.value_listeners_start_song;
    // }
    res[key].total_value_listeners_after_15s += song.value_listeners_after_15s;
    // Эта формула эквивалента формуле ниже: вычиатем 100 как бы принимая предыдущие значение за 100
    // , но как вывести алгебраически не могу. Сделать позже
    // res[key].ratio_percent                    =  (res[key].total_value_listeners_after_15s / res[key].total_value_listeners_start_song * 100 - 100).toFixed(2);
    res[key].ratio_percent                   = ((res[key].total_value_listeners_after_15s - res[key].total_value_listeners_start_song) / res[key].total_value_listeners_start_song * 100).toFixed(2);
  }
  // console.log('sum=', sum);
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

// 22.04         283+112+223+347+464+487+436+487+474+462=3775
// 22.04 - 23.04 283+112+223+348+465+490+440+494+483+486=3824

// 23.04         104+293+438+505+547+544+531+538=3500
// 22.04 - 23.04 104+293+438+505+547+544+531+538=3500

function test_start () {
  start(
    [
      { db: 'blackstarradio.hostingradio.ru', stream: '/blackstarradio128.mp3'},
    ],
    '2016-04-22',
    '2016-04-23',
    function(err, result) {
      // console.log(result);
      console.log('That\'s all');
      // test_start();
    }
  );
}
