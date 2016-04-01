#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// МОДУЛЬ ДЛЯ ИЗМЕРЕНИЯ ВРЕМЕНИ

module.exports = function () {
  var hash = {};

  function time (label) {
    hash[label] = new Date().getTime();
  }

  function timeEnd (label) {
    var start = hash[label];
    if (!start) { console.log('Error: Not exist start for label => '+label); return null;}
    console.log(label, new Date().getTime() - start);
  }

  function get_timeEnd (label) {
    var start = hash[label];
    if (!start) { console.log('Error: Not exist start for label => '+label); return null;}
    return label+' '+(new Date().getTime() - start);
  }

  return { time: time, timeEnd: timeEnd, get_timeEnd: get_timeEnd };
}

// var meas = module.exports();
// meas.time('Time:');
// setTimeout(function() {
//   meas.timeEnd('Time:');
//   // console.log(meas.get_timeEnd('Time:'));
// }, 1000);