#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// Reports -> Time Spent Listening

var CONF   = require('/icestat/config.js').settings();
var asc    = require(CONF.my_modules + 'asc.js');
var time   = require(CONF.my_modules + 'time.js');
var child  = require(CONF.my_modules + 'child.js');
var db     = require(CONF.my_modules + 'usedb.js');
var moment = require('moment');

var get_exist_tables = require(CONF.oft_modules + 'get_exist_tables.js');

// 24 часа в секундах, используем чтобы не учитывать всех слушателей,
// которые больше этого времени слушают
var HOW_LONG_LISTEN = 86400;
var MAX_DAY         = 100; // максимальный диапозон дат в днях

test_start();

var express = require('express');
var router  = express.Router();
router.post('/', function(req, res, next) {
  // от клиента
  // [{ db: 'stations_dorognoe.hostingradio.ru', mount: '/dor_64_no' }, { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }],

  var radios     = JSON.parse(req.body.radios);
  var start_date = moment(req.body.startDate).format('YYYY-MM-DD'); // TODO: Проверить формат времени
  var end_date   = moment(req.body.endDate).format('YYYY-MM-DD');
  // console.log(station, mount, date);

  // start(radios, start_date, end_date, function(err, result) {
  start([
    { db: 'radiovera.hostingradio.ru',  mount: '/radiovera64.aacp' },
    { db: 'dorognoe.hostingradio.ru',   mount: '/dor_64_no' },
    // { db: 'blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }
  ],
  '2016-03-07',
  '2016-03-08', function (err, result) {
     if (err) {
      err.status = 404; next(err);
    } else {
      res.json(result);
    }
  });
});

// ---------------------------------------------------------------------------------------------------

function start (params, start_date, end_date, ext_cb) {
  console.time('Time');
  var range_data = time.get_range_date(start_date, end_date, MAX_DAY);
  var total_seconds_of_period = {}; // хэш, куда будем складывать все данные
  asc.ar_series_with_params(for_each_station, params, [start_date, end_date, total_seconds_of_period], function(err, res) {
    var answer = {};
    if (!err) { answer = calc_total(total_seconds_of_period, params, range_data); }
    console.timeEnd('Time');
    ext_cb(err || null, answer);
  });
}


function for_each_station (radio, additional_params, callback) {
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  CONTEXT.set('station', radio.db);
  CONTEXT.set('stream',  radio.mount);
  CONTEXT.set('start_date',  additional_params[0]);
  CONTEXT.set('end_date',    additional_params[1]);
  CONTEXT.set('total_seconds_of_period', additional_params[2]);
  // console.log(CONTEXT.get('station'), CONTEXT.get('stream'), CONTEXT.get('start_date'), CONTEXT.get('end_date'));
  asc.series_move_data([
    (cbm) => { stations_get_exist_tables(CONTEXT, cbm); },
    (cbm) => { CONTEXT.set('range_date', check_range_date(CONTEXT)); cbm(null, 'check_range_date'); },
    (cbm) => { get_listeners_in_current_day(CONTEXT, cbm);},
    (cbm) => { get_listeners_who_start_in_past_day(CONTEXT, cbm);},
    // (cbm) => { CONTEXT.set('total_seconds_of_period', total_seconds_minus_who_start_in_past_day(CONTEXT));   cbm(null, 'total_seconds_minus_who_start_in_past_day'); },
    (cbm) => { total_seconds_minus_who_start_in_past_day(CONTEXT);   cbm(null, 'total_seconds_minus_who_start_in_past_day'); },
    ],function(err, result) {
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      console.log('\n\n async API_TIME_SPENT_LISTENING.JS series dine: ', err || result);
      callback(err || null, CONTEXT.get('total_seconds_of_period'));
  });
}
// ---------------------------------------------------------------------------------------------------


// на выход { '2015-12-31': 0, '2016-01-01': 1, ... }
function stations_get_exist_tables (CONTEXT, cb_main) {
  get_exist_tables.any_tables(CONTEXT.get('station'), function(err, res) {
    if (!err) CONTEXT.set('stations_exist_tables', res);
    cb_main(err || null, 'get_exist_tables.stations');
  });
}


// построили массив сущеcтвующих дат в базе
// return –– ['2015-12-31', '2016-01-01']
function check_range_date (CONTEXT) {
  var range_date = time.get_range_date(CONTEXT.get('start_date'), CONTEXT.get('end_date'), MAX_DAY),
      res        = [];
  var stations_exist_tables = CONTEXT.get('stations_exist_tables');
  for (var i = 0, l = range_date.length; i < l; i++) {
    var data = range_date[i];
    if (stations_exist_tables[data]) { res.push(data);}
  }
  return res;
}


// total_seconds –– { '2016-03-07': 1401049, ... }
function get_listeners_in_current_day (CONTEXT, cb_main) {
  var get_data = function (date, add_params, cb) {
    var CONTEXT = add_params[0];
    var query = "SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, SUM(duration) as totalSeconds FROM `"+CONTEXT.get('station')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"' AND duration<="+HOW_LONG_LISTEN;
    // console.log(query)
    db.read(query, function(err, res) { cb(err || null, [date, res || null]); });
  };

  asc.ar_series_with_params(get_data, CONTEXT.get('range_date'), [CONTEXT], function(err, result) {
    if (!err) { CONTEXT.set('total_seconds', prepare_total_seconds(result)); }
    // console.log(CONTEXT.get('total_seconds'));
    cb_main(err || null, 'get_listeners_in_current_day');
  });
}


// return –– { '2016-03-07': 1401049, '2016-03-08': 1139654 }
function prepare_total_seconds (data) {
  var res = {};
  for (var i = 0, l = data.length; i < l; i++) {
    var date        = data[i][0],
        ar_one_data = data[i][1][0];
    res[date] = ar_one_data.totalSeconds;
  }
  return res;
}


// who_start_in_past_day –– { '2016-03-07': 105937 , ... }
function get_listeners_who_start_in_past_day (CONTEXT, cb_main) {
  var get_data = function (date, add_params, cb) {
    var CONTEXT = add_params[0];
    var query = "SELECT date, duration FROM `"+CONTEXT.get('station')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"' AND UNIX_TIMESTAMP(date)-duration<UNIX_TIMESTAMP('"+date+"') AND duration<="+HOW_LONG_LISTEN;
    // console.log(query);
    db.read(query, function(err, res) { cb(err || null, [date, res || null]); });
  };

  asc.ar_series_with_params(get_data, CONTEXT.get('range_date'), [CONTEXT], function(err, result) {
    if (!err) { CONTEXT.set('who_start_in_past_day', prepare_who_start_in_past_day(result)); }
    // console.log(CONTEXT.get('who_start_in_past_day'));
    cb_main(err || null, 'get_listeners_who_start_in_past_day');
  });
}


// считаем разницу между началом текущего дня и времени начало прослушивания
// в прошлых сутках пользователем. Потом это цифру вычтем для из общего времени
// data ––
/* [
     [ '2016-03-07', [
          [ RowDataPacket { date: Mon Mar 07 2016 00:04:50 GMT+0300 (MSK), duration: 1202 }, RowDataPacket { date: Mon Mar 07 2016 00:07:32 GMT+0300 (MSK), duration: 2278 },]
          [ RowDataPacket { date: Tue Mar 08 2016 00:01:07 GMT+0300 (MSK), duration: 799 },  RowDataPacket { date: Tue Mar 08 2016 00:03:18 GMT+0300 (MSK), duration: 709 },]
      ] ],
      ...
   ]*/
// return { '2016-03-07': 105937 , ... }
function prepare_who_start_in_past_day (data) {
  var res = {};
  for (var i = 0, l = data.length; i < l; i++) {
    var date        = data[i][0];
    var ar_one_date = data[i][1];
    res[date]       = 0;
    for (var j = 0, l1 = ar_one_date.length; j < l1; j++) {
      var listener     = ar_one_date[j];
      var end_date_s   = time.get(listener.date).in_s;
      var duration_s   = listener.duration;
      var start_date_s = end_date_s - duration_s;
      var diff         = time.get(date).in_s - start_date_s;
      // console.log(end_date_s, duration_s, start_date_s, diff);
      // console.log('date', date, time.get(date).in_s, '-', start_date_s);
      res[date] += diff;
    }
  }
  // console.log(res);
  return res;
}


// вычитаем из суммарного времени в секундах на определенную дату сумму времени
// в секундах на эту же дату, которые пользователи слушали в прошлых сутках.
// total_seconds –– { '2016-03-07': 1401049, ... }
// who_start_in_past_day –– { '2016-03-07': 105937 , ... }
// total_seconds_of_period ––
// return –– { 'radiovera.hostingradio.ru_total': 2267151, 'radiovera.hostingradio.ru_2016-03-07': 1295112, 'radiovera.hostingradio.ru_2016-03-08': 972039 }
function total_seconds_minus_who_start_in_past_day (CONTEXT) {
  var total_seconds           = CONTEXT.get('total_seconds'),
      who_start_in_past_day   = CONTEXT.get('who_start_in_past_day'),
      total_seconds_of_period = CONTEXT.get('total_seconds_of_period'),
      // res                     = {},
      station                 = CONTEXT.get('station');
  var dates = Object.keys(total_seconds);
  total_seconds_of_period[station+'_total'] = 0;
  for (var i = 0, l = dates.length; i < l; i++) {
    var date = dates[i];
     // console.log('total_seconds[date] - who_start_in_past_day[date]', total_seconds[date], '-', who_start_in_past_day[date]);
     var diff = total_seconds[date] - who_start_in_past_day[date];
     total_seconds_of_period[station+'_'+date] = diff;
     total_seconds_of_period[station+'_total'] += diff;
  }
  // console.log(res);
}


// создаем фикальнй объект и вычисляем колонку total
// data –– { 'radiovera.hostingradio.ru_total': 2267151, 'radiovera.hostingradio.ru_2016-03-07': 1295112, 'radiovera.hostingradio.ru_2016-03-08': 972039, 'dorognoe.hostingradio.ru_total': 160689844, 'dorognoe.hostingradio.ru_2016-03-07': 86148347, 'dorognoe.hostingradio.ru_2016-03-08': 74541497 }
// db_mount   –– [ { db: 'radiovera.hostingradio.ru', mount: '/radiovera64.aacp' }, { db: 'dorognoe.hostingradio.ru', mount: '/dor_64_no' }, ]
//range_date –– [ '2016-03-07', '2016-03-08' ]
// return ––
function calc_total (data, db_mount, range_date) {
  var res      = {};
  range_date.push('total');

  for (var i = 0, l = range_date.length; i < l; i++) {
    var date = range_date[i];
    res['total_'+date] = 0;
    for (var j = 0, l1 = db_mount.length; j < l1; j++) {
      var station     = db_mount[j].db,
          station_key = station+'_'+date;
      res[station_key]    = data[station_key];
      res['total_'+date] += data[station_key];
    }
  }
  // console.log(new_data)
  // console.log(res);
  return res;
}

function test_start () {
  // [{ db: 'stations_dorognoe.hostingradio.ru', mount: '/dor_64_no' }, { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }],
  start(
    [
      { db: 'stations_dorognoe.hostingradio.ru',  mount: '/dor_64_no' },
      // { db: 'radiovera.hostingradio.ru',  mount: '/radiovera64.aacp' },
      // { db: 'blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }
    ],
    '2016-03-03',
    '2016-04-03',
    // '2016-04-04',
    function(err, result) {
      console.log(result);
      console.log('That\'s all');
      // test_start();
    }
  );
}