#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

var async             = require('/usr/local/lib/node_modules/async');
var work_date         = require('/icestat/peak_test/work_date.js');
var show_exist_tables = require('/icestat/peak_test/show_exist_tables.js');
var db                = require('/icestat/my/usedb.js');
var moment            = require('moment');

var CACHE       = {}; // [db+'_'+day+'_'+mount] = ConCurrent
// var MAX_DAYS = 7; // включаем в диапазон НЕ более 7 дней
var MAX_DAYS    = 35; // включаем в диапазон НЕ более 7 дней

var express = require('express');
var router  = express.Router();

// next вызывать в случае ошибки
router.post('/', function(req, res, next) {
  var startDate = moment(req.body.startDate).format('YYYY-MM-DD');
  var endDate   = moment(req.body.endDate).format('YYYY-MM-DD');
  var radios    = JSON.parse(req.body.radios);
  // var daysAgo = req.body.daysAgo;

  // CONTEXT[key] = [ [date, val],... ], where key = mount+DATA_TYPE+DATA_FOR
  // where mount = '/blackstarrad' || '/dor_64_no'
  // where DATA_TYPE = '_main' || '_7days_ago'
  // where DATA_FOR = '_Highcharts' || '_Table'
  // for example: key='/dor_64_no_main_Highcharts'
  start(
    startDate,
    endDate,
    radios,
    function(CONTEXT) {
      // console.log(Object.keys(CONTEXT));
      // console.log(CONTEXT);
      res.json(CONTEXT);
    }
  );
});
module.exports = router;


// test_start(); //var count = 0;
function test_start() {
  console.time('start');
  start(
    '2016-02-16',
    '2016-02-17', [{
      db: 'stations_dorognoe.hostingradio.ru',
      mount: '/dor_64_no'
    }, {
      db: 'stations_blackstarradio.hostingradio.ru',
      mount: '/blackstarradio128.mp3'
    }],
    function(CONTEXT) {
      console.timeEnd('start');
      // if (count === 2) {console.log('finish'); return;}
      // count++;
      // test_start();
      // console.log(Object.keys(CONTEXT))
      // console.log(CONTEXT);
      // console.log(JSON.parse(JSON.stringify(CONTEXT)));
      // console.log(Object.keys(CACHE));
      // res.json(CONTEXT);
    }
  );
}


//////////////////////
function start(start_day, end_day, stationS_data, callback) {
  var Tasks = [];
  var CONTEXT = {};
  for (var i = 0, l = stationS_data.length; i < l; i++) {
    let one_station = stationS_data[i];
    Tasks.push(function(async_callback) {
      one_station_process(start_day, end_day, one_station.db, one_station.mount, CONTEXT, async_callback);
    });
  }
  async.parallel(Tasks, function() { callback(CONTEXT); }); //
}


//////////////////////
function one_station_process(start_day, end_day, database, mount, CONTEXT, callback) {
  function process_series(days_arr, posfix, cb) {
    var Tasks = [];
    for (var i = 0, l = days_arr.length; i < l; i++) {
      let day = days_arr[i];
      Tasks.push(function(async_callback) {
        get_peak_listeners(database, mount, day, posfix, CONTEXT, async_callback);
      });
    }
    async.series(Tasks, cb); //
  }

  // Находим доступные таблицы дат { '2015-12-29': 0, '2015-12-31': 1, ... }
  show_exist_tables.get(database, function(err, existedTables) {
    if (!err) {
      // { main_days_arr: [ '2016-02-16', '2016-02-17' ], add_7days_ago_arr: [ '2016-02-09', '2016-02-10' ]}
      var res = create_days_arr(start_day, end_day, existedTables);
      async.parallel([
        (async_callback) => {
          process_series(res.main_days_arr, 'main', async_callback);
        }, (async_callback) => {
          process_series(res.add_7days_ago_arr, '7days_ago', async_callback);
        }
      ], callback);
    } else {
      next(err);
      // err email
      callback();
    }
  });
}


//////////////////////
function get_peak_listeners(db, mount, day, posfix, CONTEXT, callback) {
  var Highcharts_key = mount+'_'+posfix+'_Highcharts';
  if (!CONTEXT[Highcharts_key]) {
    CONTEXT[Highcharts_key] = [];
  }
  var Table_key = mount+'_'+posfix+'_Table';
  if (!CONTEXT[Table_key]) {
    CONTEXT[Table_key] = [];
  }

  get_data_from_table(db, mount, day, CONTEXT[Highcharts_key], CONTEXT[Table_key], callback);
}


//////////////////////
function get_data_from_table (database, mount, day, Highcharts_res, Table_res, callback) {
  var start_day_sec = Math.floor(new Date(day + ' 00:00:00').getTime() / 1000) + 1; // '2016-02-16 00:00:00'
  var step_sec      = 15 * 60; // 15 min
  var max_step      = Math.floor((24 * 60 * 60) / step_sec);

  var cache_key = database+'_'+day+'_'+mount;
  if (CACHE[cache_key]) {
    set_data_to_CONTEXT(CACHE[cache_key]);
    callback();
  } else {
    get_data_from_db(callback);
  }

  //
  function set_data_to_CONTEXT(ConCurrent) {
    var table_divide = 4; // в таблице в table_divide меньше точек
    var table_i      = 0;
    var table_date   = '';
    var table_val    = 0;
    start_day_sec--;      // clear magic second
    for(var i=0; i<max_step; i++) {
      var date = new Date((start_day_sec + i * step_sec) * 1000).getTime();
      var val  = ConCurrent[i];                //Math.floor( 10*Math.random() );
      Highcharts_res.push([date, val]);
      // prepare for Table
      if (table_i===0) { table_date=date; table_val=val; } // ??? table_val=val;
      table_i++;
      //if (val>table_val) { table_val=val; }       // ??? OR max
      if (table_i === table_divide) { Table_res.push([table_date, table_val]); table_i=0; table_val=0; }
    }
  }


  //
  function get_data_from_db(cb) {
    db.read("SELECT UNIX_TIMESTAMP(date) as end_sec, duration FROM `"+database+"`.`"+day+"` WHERE mount='"+mount+"'", // LIMIT 1000
      function(err, mysql_res) {
        if (!err) {
          process(mysql_res);
        }
        else {
          console.log('func get_data_from_db –– '+JSON.stringify(err));
          // err email
          next(err);
        }
        cb();
      }
    );
  }


  function process(mysql_res) {
    var ConCurrent = [];
    for (var i = 0; i < max_step; i++) { ConCurrent[i] = 0; }

    for (var k = 0, L = mysql_res.length; k < L; k++) {
      var rd = mysql_res[k];
      var end_sec = rd.end_sec - start_day_sec;
      var start_sec = end_sec - rd.duration;
      var start_step = Math.floor(start_sec / step_sec) + 1;
      // обрабатываем границу 00:00, если пользователь начал слушать в прошлых сутках
      if (start_step < 0) { start_step = 0; }
      var end_step = Math.floor(end_sec / step_sec); //console.log(start_sec, end_sec, start_step, end_step);
      for (var step = start_step; step <= end_step; step++) { ConCurrent[step]++; }
    }
    set_data_to_CONTEXT(ConCurrent);
    CACHE[cache_key] = ConCurrent;
  }
}


//////////////////////
function create_days_arr(start_day, end_day, existed_days) {
  var main_days_arr = get_days_array(start_day, end_day, existed_days, MAX_DAYS); // НЕ более MAX_DAYS дней
  var found_days = main_days_arr.length;
  var add_7days_ago_arr = get_days_array(work_date.get_7day_ago(start_day), '', existed_days, found_days); // НЕ более found_days дней // столько же, как и в main_days_arr
  // console.log(found_days, { main_days_arr: main_days_arr, add_7days_ago_arr: add_7days_ago_arr });
  // global.process.exit();
  return {
    main_days_arr: main_days_arr,
    add_7days_ago_arr: add_7days_ago_arr
  };
}


////////////////////// ('2016-02-16', '2016-02-18', {'2016-02-16':3}, 7)
function get_days_array(start_day, end_day, existed_days, max_days) { // НЕ более max_days дней
  var days = [];
  for (var i = 0; i < max_days; i++) {
    if (existed_days[start_day]) {
      days.push(start_day);
    } // ONLY if exist table with the same name
    if (start_day === end_day) { return days; }
    start_day = work_date.next_day(start_day);
  }
  return days;
}
/////////////////////////////////////////////