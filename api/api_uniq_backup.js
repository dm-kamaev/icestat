#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// Listeners -> Unique
// Считаем всех слушателей за выбранный диапазон дат, а затем во всем диапозоне дат ищем
// уникальных слушателей

var CONF   = require('/icestat/config.js').settings();
var crypto = require('crypto');
var asc    = require(CONF.my_modules + 'asc.js');
var time   = require(CONF.my_modules + 'time.js');
var child  = require(CONF.my_modules + 'child.js');
var db     = require(CONF.my_modules + 'usedb.js');

var shorthash = require(CONF.my_modules + 'shorthash.js');

var moment = require('moment');

var get_exist_tables = require(CONF.oft_modules + 'get_exist_tables.js');

var MAX_DAY = 100; // максимальный диапозон дат в днях


test_start();

var express = require('express');
var router  = express.Router();
router.post('/', function(req, res, next) {
  // от клиента
  // [{ db: 'stations_dorognoe.hostingradio.ru', mount: '/dor_64_no' }, { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }],
  var radios     = JSON.parse(req.body.radios);
  var start_date = moment(req.body.start_date).format('YYYY-MM-DD'); // TODO: Проверить формат времени
  var end_date   = moment(req.body.end_date).format('YYYY-MM-DD');
  // console.log(radios, start_date, end_date);
  // start([
  //   { db: 'stations_radiovera.hostingradio.ru',  mount: '/radiovera64.aacp' },
  //   { db: 'stations_dorognoe.hostingradio.ru',   mount: '/dor_64_no' },
  //   // { db: 'blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }
  // ],
  // '2016-03-27',
  // '2016-03-27', function (err, result) {
  start(radios, start_date, end_date, function(err, result) {
     if (err) {
      err.status = 404; next(err);
    } else {
      // console.log(result);
      res.json(result);
    }
  });
});
exports.router = router;


// ---------------------------------------------------------------------------------------------------

function start (db_mount, start_date, end_date, ext_cb) {
  console.time('Time');
  // uniqListeners_totalListeners ––  хэш, куда будем складывать все данные
  var info = { start_date: start_date, end_date: end_date, uniqListeners_totalListeners: {} };
  asc.ar_series_with_params(for_each_station, db_mount, info, function(err, res) {
    // console.log(info.uniqListeners_totalListeners);
    var range_date = time.get_range_date(start_date, end_date, MAX_DAY);
    console.timeEnd('Time');
    ext_cb(err || null, info.uniqListeners_totalListeners);
  });
}


function for_each_station (radio, info, callback) {
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  CONTEXT.set('station', radio.db);
  CONTEXT.set('stream',  radio.mount);
  CONTEXT.set('start_date',  info.start_date);
  CONTEXT.set('end_date',    info.end_date);
  CONTEXT.set('uniqListeners_allListeners', info.uniqListeners_totalListeners); // хэш, куда будем складывать все данные
  // console.log(CONTEXT.get('station'), CONTEXT.get('stream'), CONTEXT.get('start_date'), CONTEXT.get('end_date'));
  asc.series_move_data([
    (cbm) => { get_exist_tables_from_stations(CONTEXT, cbm); },
    (cbm) => { CONTEXT.set('range_date', check_range_date(CONTEXT)); cbm(null, 'check_range_date'); },
    (cbm) => { get_listeners_in_current_day(CONTEXT, cbm);},
    (cbm, data) => {     console.timeEnd('Query'); prepare_listeners(CONTEXT, data); cbm(null, 'prepare_listeners');},
    // (cbm) => {     console.timeEnd('Query'); prepare_listeners(CONTEXT); cbm(null, 'prepare_listeners');},
    ],function(err, result) {
      console.log('\n\n async API_TIME_SPENT_LISTENING.JS series dine: ', err || result);
      callback(err || null, 'for_each_station');
  });
}
// ---------------------------------------------------------------------------------------------------


// { '2016-03-10': 1, '2016-03-11': 2}
function get_exist_tables_from_stations (CONTEXT, cb_main) {
  get_exist_tables.any_tables(CONTEXT.get('station'), function(err, res) {
   if (!err) { CONTEXT.set('stations_exist_tables', res); }
    cb_main(err || null, 'get_exist_tables.any_tables');
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
    if (stations_exist_tables[data]) { res.push(data); }
  }
  return res;
}


function get_listeners_in_current_day (CONTEXT, cb_main) {
  var get_data = function (date, context, cb) {
    var CONTEXT = context;
    var query = "SELECT ip, agent FROM `"+CONTEXT.get('station')+"`.`"+date+"` WHERE mount='"+CONTEXT.get('stream')+"'";
    // console.log(query)
    db.read(query, function(err, res) { cb(err || null, [ date, res || null ]); });
  };
  console.time('Query');
  asc.ar_series_with_params(get_data, CONTEXT.get('range_date'), CONTEXT, function(err, res) {
    // if (!err) { CONTEXT.set('listeners', res); }
    cb_main(err || null, res, 'get_listeners_in_current_day');
  });
}


// скаладываем всех слушателей радио за диапазон дат и вычисляем для этого диапазона дат
// уникальных пользователей по ip and user-agent
//  так же вычисляем total all listeners and all uniq
// на входе uniqListeners_allListeners  –– {}
// ны выходе uniqListeners_allListeners –– { 'stations_dorognoe.hostingradio.ru_2016-03-27_2016-03-27': { all: 33563, uniq: 11279 }, 'stations_blackstarradio.hostingradio.ru_2016-03-27_2016-03-27': { all: 259018, uniq: 19989 } }
// data    –– [ [ '2016-03-27', [ {ip: '195.16.111.67', agent: 'RadioVERA/2.1.0'}, ... ], ... ]
function prepare_listeners (CONTEXT, data) {
  var res     = CONTEXT.get('uniqListeners_allListeners'),
      station = CONTEXT.get('station');
      // data    = CONTEXT.get('listeners') || [];

  var temp_uniq = {},  // временно храним уникальных пользователей
      key       = station+'_'+CONTEXT.get('stream')+'_'+CONTEXT.get('start_date')+'_'+CONTEXT.get('end_date');
  res[key]      = {};
  res[key].all  = 0;
  for (var i = 0, l = data.length; i < l; i++) {
    var date              = data[i][0],
        listeners_by_date = data[i][1],
        l1                = listeners_by_date.length; // общее кол-во слушателей
    res[key].all += l1; // за все дни складываем
    for (var j = 0; j < l1; j++) {
      var listener = listeners_by_date[j];
      temp_uniq[listener.ip+'_'+listener.agent] = 1;
    }
  }
  res[key].uniq = Object.keys(temp_uniq).length; // уникальные пользователи
  // console.log(res);
}


function test_start () {
  // [{ db: 'stations_dorognoe.hostingradio.ru', mount: '/dor_64_no' }, { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }],
  start(
    [
      // { db: 'stations_radiovera.hostingradio.ru',  mount: '/radiovera64.aacp' },
      { db: 'stations_dorognoe.hostingradio.ru',   mount: '/dor_64_no' },
      { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }
    ],
    '2016-03-23',
    '2016-03-27',
    // '2016-04-05',
    // '2016-04-05',
    // '2016-03-01',
    // '2016-04-01',
    function(err, result) {
      console.log(result);
      console.log('That\'s all');
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      // test_start();
    }
  );
}