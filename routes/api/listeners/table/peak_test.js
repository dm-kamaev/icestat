#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ОПИСАНИЕ СКРИПТА

var db    = require('/root/icestat/my/usedb.js');
var async = require('async');


var CONTEXT = {};
CONTEXT     = require('/root/icestat/my/context.js')
              .add_set_get(CONTEXT);
// ---------------------------------------------------------------------------------------------------
console.time('QUERY');
async.series([
  (cbm) => {get_query(cbm);},
  (cbm) => {prepare('2016-02-16'); cbm(null, 'prepare');},
  ],function(err, result) {
      db.connection_end();
      console.log('\n\n async PEAK_TEST.JS series dine: ', err || result);
});

// ---------------------------------------------------------------------------------------------------

function get_query (callback_main) {
  db.read(
    "SELECT UNIX_TIMESTAMP(date) as end_sec, duration FROM `stations_dorognoe.hostingradio.ru`.`2016-02-16` WHERE mount='/dor_64_no'", // LIMIT 10
    // 'SELECT UNIX_TIMESTAMP(date) as end_sec, duration FROM `stations_dorognoe.hostingradio.ru`.`2016-02-16` WHERE mount',
    // 'SELECT HOUR(date) as h, MINUTE(date) as m, ROUND(duration/60) as d_in_min FROM `stations_dorognoe.hostingradio.ru`.`2016-02-16`',
    // 'SELECT HOUR(date) as h, MINUTE(date) as m, ROUND(duration/60) as d_in_min FROM `stations_dorognoe.hostingradio.ru`.`2016-02-16` LIMIT 5',
    // 'SELECT HOUR(date) as h, MINUTE(date) as m, ROUND(duration/60) as d_in_min FROM `stations_blackstarradio.hostingradio.ru`.`2016-02-16`',
    function(err, result) {
      if (!err) {
        CONTEXT.set('query', result);
        // console.log(result);
      }
      console.timeEnd('QUERY');
      callback_main(err || null, 'Articles.get_titleUrl');
    }
  );
}


function prepare (day) {
  console.time('process Test');
  var mysql_res = CONTEXT.get('query');
  var start_day_sec = Math.floor(new Date(day+' 00:00:00').getTime()/1000) + 1; // '2016-02-16 00:00:00'
  var step_sec      = 15*60;   // 15 min
  var max_step      = Math.floor( (24*60*60) / step_sec );
  var ConCurrent    = [];
  for(var i = 0; i < max_step; i++) { ConCurrent[i]=0; }

  for(var k = 0, L = mysql_res.length; k < L; k++) {
    var rd         = mysql_res[k];
    var end_sec    = rd.end_sec - start_day_sec;
    var start_sec  = end_sec - rd.duration;
    var start_step = Math.floor(start_sec/step_sec) + 1;          if (start_step<0) { start_step=0; }
    var end_step   = Math.floor(  end_sec/step_sec);                                                              //console.log(start_sec, end_sec, start_step, end_step);
    for(var step = start_step; step <= end_step; step++) { ConCurrent[step]++; }
  }
  console.timeEnd('process Test');
  console.log(ConCurrent);      // ConCurrent.length,
}


// function prepare () {
//   var ar_res = CONTEXT.get('query');
//   var res    = [];
//   for (var i = 0, l = ar_res.length; i < l; i++) {
//     var el = ar_res[i];
//     // console.log(el);
//     var end_abs_min = 60 * el.h + el.m;
//     // console.log('60 * ', el.h, ' + ', el.m, ' = ', end_abs_min);
//     // end_abs_min = Math.floor(end_abs_min / 15);
//     // console.log('Math.floor( / 15) = ', end_abs_min);
//     var start_abs_min = end_abs_min - el.d_in_min;
//     if (start_abs_min < 0) {
//       start_abs_min = 0;
//     }
//     // console.log(end_abs_min, ' - ', el.d_in_min, ' = ', start_abs_min);
//     // console.log(start_abs_min, ' => ', end_abs_min);
//     for (var j = start_abs_min; j <= end_abs_min; j++) {
//     // for (var j = Math.floor(start_abs_min / 15); j <= end_abs_min; j++) {
//     // var start = Math.ceil(start_abs_min / 15),
//         // end   = Math.ceil(end_abs_min / 15);
//     // console.log(start ,' => ', end);
//     // for (var j = start; j <= end; j++) {
//       if (!res[j]) {res[j] = 0;}
//       res[j]++;
//     }
//   }
//   console.log('res', res);
//   console.log('len res ', res.length);
// }