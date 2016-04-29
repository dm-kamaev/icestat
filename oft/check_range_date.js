#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ПРОВЕРЯЕМ НАЛИЧИЕ ТАБЛИЦ С ТАКИМ ИМЕНЕМ (YYYY-MM-DD)

var CONF  = require('/icestat/config.js').settings();
var time  = require(CONF.my_modules + 'time.js');



// возвращаем массив сущеcтвующих дат-таблиц в базе
// на вход передаем хэш дат-таблиц
// in_playlist –– { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10,}
// start_date,end_date –– YYYY-MM-DD
// max_day –– максимальный диапазон между начальной и конечной датой по default это 365
// return –– ['2015-12-31', '2016-01-01']
exports.in_playlist = function (CONTEXT, max_day) {
  var range_date = time.get_range_date(CONTEXT.get('start_date'), CONTEXT.get('end_date'), max_day || 365),
      res        = [];
  var playlist_tables = CONTEXT.get('in_playlist');
  for (var i = 0, l = range_date.length; i < l; i++) {
    var date = range_date[i];
    if (playlist_tables[date] || playlist_tables[date] === 0) { res.push(date); }
  }
  return res;
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({'in_playlist': {'2016-04-10':1, '2016-04-11':2}, start_date: '2016-04-10', end_date:'2016-04-20'});
// console.log(exports.in_playlist(CONTEXT, 100));


// возвращаем массив сущеcтвующих дат-таблиц в базе
// на вход передаем хэш дат-таблиц
// in_stations –– { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10,}
// start_date,end_date –– YYYY-MM-DD
// max_day –– максимальный диапазон между начальной и конечной датой по default это 365
// return –– ['2015-12-31', '2016-01-01']
exports.in_stations = function (CONTEXT, max_day) {
  var range_date = time.get_range_date(CONTEXT.get('start_date'), CONTEXT.get('end_date'), max_day || 365),
      res        = [];
  var playlist_tables = CONTEXT.get('in_stations');
  for (var i = 0, l = range_date.length; i < l; i++) {
    var date = range_date[i];
    if (playlist_tables[date] || playlist_tables[date] === 0) { res.push(date); }
  }
  return res;
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({'in_playlist': {'2016-04-10':1, '2016-04-11':2}, start_date: '2016-04-10', end_date:'2016-04-20'});
// console.log(exports.in_playlist(CONTEXT, 100));