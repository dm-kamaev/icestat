#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// Other -> Duration
// КОЛИЧЕСТВО СЛУШАТЕЛЕЙ В ДИАПАЗОНАХ ВРЕМЕНИ.
// СКОЛЬКО СЛУШАТЕЛЕЙ ПРОСЛУШИВАЛО СТАНЦИЮ В ВРЕМЕННЫХ ИНТЕРВАЛАХ.

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc.js');
var db    = require(CONF.my_modules + 'usedb.js');
var fs    = require('fs');
var time  = require(CONF.my_modules + 'time.js');

var get_exist_tables = require(CONF.oft_modules + 'get_exist_tables.js');

var express = require('express');

var async = require('async');

var mounts = require('../include/mounts');

// test_start();
var router = express.Router();
router.post('/', function(req, res, next) {
  var mountList = JSON.parse(req.body.mounts);
  start(req.body, mountList, function(err, result) {
    if (err) {
      err.status = 404; next(err);
    } else {
      res.json(result);
    }
  });
});
module.exports = router;

// ---------------------------------------------------------------------------------------------------
function start (req_body, mountList, ext_cb) {
  console.log(time.format('Дата:YYYY-MM-DD hh:mm', time.get()));
  console.time('Time');
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  async.series([
    (cbm) => { // TODO: Переписать эту функцию
      var sql = "SELECT \n" +
              "COUNT(case when duration > 0 and duration <= 300 then 1 end) as d_5min,\n" +
              "COUNT(case when duration >= 300 and duration <= 600 then 1 end) as d_5_10min,\n" +
              "COUNT(case when duration >= 600 and duration <= 3000 then 1 end) as d_10_30min,\n" +
              "COUNT(case when duration >= 18000 then 1 end) as d_more_5h,\n" +
              "COUNT(case when duration >= 7200 and duration <= 18000 then 1 end) as d_2_5h,\n" +
              "COUNT(case when duration >= 3600 and duration <= 7200 then 1 end) as d_1_2h,\n" +
              "COUNT(case when duration >= 1800 and duration <= 3600 then 1 end) as d_30m_1h\n" +
          "FROM `{0}`";
      async.map(mountList, mounts.getDataByMount.bind({ params: req_body, sql: sql}), function(err, results) {
        if (!err) { CONTEXT.set('results', results); }
        cbm(err || null, 'async.map');
      });
    },
    (cbm) => { CONTEXT.set('sum_data', sum_data(CONTEXT)); cbm(null, 'sum_data'); },
  ], function(err, result) {
      console.timeEnd('Time');
      console.log('\n\n async DURATIONS.JS series dine: ', err || result);
      ext_cb(err || null, CONTEXT.get('sum_data'));
  });
}
// ---------------------------------------------------------------------------------------------------

/*{ data: { Result: 'OK', TotalRecordCount: 348746, Records: [ [Object] ] },
  mountItem:
   { mount_id: '20',
     mount: '/blackstarradio128.mp3',
     name: 'BlackStarRadio',
     hostname: 'blackstarradio.hostingradio.ru',
     station_url: 'http://blackstarradio.hostingradio.ru:8024/status_stream.xsl' } }*/
function sum_data (CONTEXT) {
  var results = CONTEXT.get('results'), res = {};
  res.total = {
    d_5min    : 0,
    d_5_10min : 0,
    d_10_30min: 0,
    d_more_5h : 0,
    d_2_5h    : 0,
    d_1_2h    : 0,
    d_30m_1h  : 0,
  };
  // console.log(results); console.log(results[0].data.Records); console.log(results[1].data.Records);
  for (var i = 0, l = results.length; i < l; i++) {
    var items = results[i].data.Records, radio_name = results[i].mountItem.name;
    for (var j = 0, l1 = items.length; j < l1; j++) {
      var hash = items[j];
        if (!res[radio_name]) {
          res[radio_name] = {
            d_5min    : 0,
            d_5_10min : 0,
            d_10_30min: 0,
            d_more_5h : 0,
            d_2_5h    : 0,
            d_1_2h    : 0,
            d_30m_1h  : 0,
          };
        }
      var radio = res[radio_name];
      radio.d_5min     += hash.d_5min;
      radio.d_5_10min  += hash.d_5_10min;
      radio.d_10_30min += hash.d_10_30min;
      radio.d_more_5h  += hash.d_more_5h;
      radio.d_2_5h     += hash.d_2_5h;
      radio.d_1_2h     += hash.d_1_2h;
      radio.d_30m_1h   += hash.d_30m_1h;

      res.total.d_5min     += hash.d_5min;
      res.total.d_5_10min  += hash.d_5_10min;
      res.total.d_10_30min += hash.d_10_30min;
      res.total.d_more_5h  += hash.d_more_5h;
      res.total.d_2_5h     += hash.d_2_5h;
      res.total.d_1_2h     += hash.d_1_2h;
      res.total.d_30m_1h   += hash.d_30m_1h;
    }
  }
  // console.log('OUT = ', res);
  return res;
}


//
function test_start () {
  start(
    [ { mount_id: '20',
        mount: '/blackstarradio128.mp3',
        name: 'BlackStarRadio',
        hostname: 'blackstarradio.hostingradio.ru',
        station_url: 'http://blackstarradio.hostingradio.ru:8024/status_stream.xsl' },
      { mount_id: '235',
        mount: '/europaplus256.mp3',
        name: 'emg-europaplus-256mp3',
        hostname: 'ep256.hostingradio.ru',
        station_url: 'http://ep256.hostingradio.ru:8052/status_stream.xsl' } ],
    function(err, result) {
      console.log(result);
      console.log('That\'s all');
      // test_start();
    }
  );
}


// OLD CODE: REMOVE
// var express = require('express');

// var async = require('async');

// var mounts = require('../include/mounts');

// var router = express.Router();
// router.post('/', function(req, res, next) {
//     var mountList = JSON.parse(req.body.mounts);
//     var sql = "SELECT \n" +
//             "COUNT(case when duration > 0 and duration <= 300 then 1 end) as d_5min,\n" +
//             "COUNT(case when duration >= 300 and duration <= 600 then 1 end) as d_5_10min,\n" +
//             "COUNT(case when duration >= 600 and duration <= 3000 then 1 end) as d_10_30min,\n" +
//             "COUNT(case when duration >= 18000 then 1 end) as d_more_5h,\n" +
//             "COUNT(case when duration >= 7200 and duration <= 18000 then 1 end) as d_2_5h,\n" +
//             "COUNT(case when duration >= 3600 and duration <= 7200 then 1 end) as d_1_2h,\n" +
//             "COUNT(case when duration >= 1800 and duration <= 3600 then 1 end) as d_30m_1h\n" +
//         "FROM `{0}`";
//     async.map(mountList, mounts.getDataByMount.bind({params:req.body, sql: sql}), function(err, results) {
//         if (err) {
//             err.status = 404;
//             next(err);
//         } else {
//             var util = require('util');
//             console.log(util.inspect(results));
//             console.log(results[0].data.Records)
//             res.json(results);
//         }
//     });
// });

// module.exports = router;


