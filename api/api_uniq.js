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


// test_start();

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
  asc.series([
    (cbm) => { get_exist_tables_from_stations(CONTEXT, cbm); },
    (cbm) => { CONTEXT.set('range_date', check_range_date(CONTEXT)); cbm(null, 'check_range_date'); },
    (cbm) => { get_listeners_in_current_day(CONTEXT, cbm);},
    ],function(err, result) {
      var who = 'radio = '+radio.db+', stream = '+radio.mount;
      console.log('\n\n async API_TIME_SPENT_LISTENING.JS series dine: '+who, err || result);
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
    db.read(query, function(err, res) { cb(err || null, calc_allUniq_listeners(CONTEXT, date, res || null)); });
  };
  CONTEXT.set('temp_uniq', {}); // хэш с пользователями [ip+'_'+agent] = 1
  CONTEXT.set('key', CONTEXT.get('station')+'_'+CONTEXT.get('stream')+'_'+CONTEXT.get('start_date')+'_'+CONTEXT.get('end_date'));
  asc.ar_series_with_params(get_data, CONTEXT.get('range_date'), CONTEXT, function(err, res) {
    if (!err) CONTEXT.get('uniqListeners_allListeners')[CONTEXT.get('key')].uniq = Object.keys(CONTEXT.get('temp_uniq')).length;
    cb_main(err || null, 'get_listeners_in_current_day');
  });
}

// скаладываем всех слушателей радио за диапазон дат и вычисляем для этого диапазона дат
// уникальных пользователей по ip and user-agent
// на входе uniqListeners_allListeners  –– {}
// ны выходе uniqListeners_allListeners –– { 'stations_dorognoe.hostingradio.ru_2016-03-27_2016-03-27': { all: 33563, uniq: 11279 }, 'stations_blackstarradio.hostingradio.ru_2016-03-27_2016-03-27': { all: 259018, uniq: 19989 } }
// date –– '2016-03-27'
// listeners_by_date –– [ {ip: '195.16.111.67', agent: 'RadioVERA/2.1.0'}, ... ]
function calc_allUniq_listeners (CONTEXT, date, listeners_by_date) {
  var res       = CONTEXT.get('uniqListeners_allListeners'),
      temp_uniq = CONTEXT.get('temp_uniq'), // хэш с пользователями [ip+'_'+agent] = 1
      key       = CONTEXT.get('key');

  if (!res[key])     res[key]     = {};
  if (!res[key].all) res[key].all = 0;
  var l1 = listeners_by_date.length; // общее кол-во слушателей
  res[key].all += l1; // за все дни складываем
  for (var j = 0; j < l1; j++) {
    var listener = listeners_by_date[j];
    temp_uniq[listener.ip + '_' + listener.agent] = 1;
    // var md5sum = crypto.createHash('md5');
    // temp_uniq[ md5sum.update(listener.ip+listener.agent).digest('hex') ] = 1;
  }
  // console.log(res);
}


function test_start () {
  // [{ db: 'stations_dorognoe.hostingradio.ru', mount: '/dor_64_no' }, { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }],
  start(
   [{"db":"stations_ep256.hostingradio.ru","mount":"/europaplus256.mp3","name":"emg-europaplus-256mp3"},{"db":"stations_ep128.hostingradio.ru","mount":"/ep128","name":"emg-europaplus-128mp3"},{"db":"stations_eptop128server.streamr.ru","mount":"/eptop128","name":"emg-europaplusTOP40-128mp3"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-light128.mp3","name":"emg-europaplusLight-128mp3"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-light96.aac","name":"emg-europaplusLight-96aac"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-new128.mp3","name":"emg-europaplusNew-128mp3"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-new96.aac","name":"emg-europaplusNew-96aac"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-top96.aac","name":"emg-europaplusTOP40-96aac"},{"db":"stations_eprnb128server.streamr.ru","mount":"/eprnb128","name":"emg-europaplusRNB-128mp3"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-rnb96.aac","name":"emg-europaplusRNB-96aac"},{"db":"stations_emgspb.hostingradio.ru","mount":"/ep-residance128.mp3","name":"emg-europaplusResidance-128mp3"}],
   /* [
      // { db: 'stations_radiovera.hostingradio.ru',  mount: '/radiovera64.aacp' },
      { db: 'stations_dorognoe.hostingradio.ru',   mount: '/dor_64_no' },
      { db: 'stations_blackstarradio.hostingradio.ru', mount: '/blackstarradio128.mp3' }
    ],*/
    '2016-03-27',
    '2016-03-27',
    // '2016-03-12',
    // '2016-04-12',
    function(err, result) {
      console.log(result);
      console.log('That\'s all');
      // db.connection_end(); // ВЫКЛЮЧАТЬ ПРИ РАБОТЕ ПО СЕТИ
      // test_start();
    }
  );
}