#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ПОКАЗАТЬ ПОСЕТИТЕЛЕЙ САЙТА

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc.js');
var time  = require(CONF.my_modules + 'time.js');
var wf    = require(CONF.my_modules + 'wf.js');
var fn    = require(CONF.my_modules + 'fn.js');
var color = require(CONF.my_modules + 'color.js');
// var db    = require(CONF.my_modules + 'usedb.js');
// var fs    = require('fs');
// var tr    = require(CONF.my_modules   + 'transform_data_from_file_or_base.js');

// var get_exist_tables = require(CONF.oft_modules + 'get_exist_tables.js');

var CONTEXT = require('/icestat/my/context.js').add_set_get({
  start_date: '2016-05-25',
  end_date  : '2016-05-26',
  max_days  : 200,
  report   : {},
});

start();
function start () {
  var start_date = CONTEXT.get('start_date'), end_date = CONTEXT.get('end_date');
  var list_date = time.get_range_date(start_date, end_date, CONTEXT.get('max_days'));
  var list_filename = get_list_filename(list_date);
  var read = function(filename, cb) {
    wf.read(CONF.access_log+filename, function(err, res) {
      if (!err) { prepare_data(res); }
      cb(null, null);
    });
  };
  asc.map_series(read, list_filename, (err, res) => {
    // console.log(err || null, res || null);
    if (err) { console.log(err); }
    var report = CONTEXT.get('report');
    // console.log(report);
    color.out_bgreen('Список посетителей за период c '+start_date+' по '+end_date+':');
    console.log(Object.keys(report));
    color.out_bgreen('Общее кол-во уникальных посетителей за период c '+start_date+' по '+end_date+':', Object.keys(report).length);
  });
}


// list_date –– [ '2016-05-25', '2016-05-26' ]
// res –– [ '20160525_access_log.log', '20160526_access_log.log' ]
function get_list_filename (list_date) {
  var res = [];
  for (var i = 0, l = list_date.length; i < l; i++) { res.push(list_date[i].replace(/-/g, '')+'_access_log.log'); }
  return res;
}


function prepare_data (from_file) {
  var lines = from_file.split('\n'), report = CONTEXT.get('report');
  fn.foreach_value(lines, function(line) {
    var els = line.split('\t');
    var ip = els[1], user_agent = els[5], url = els[3];
    if (is_not_interest_url(url)) { return; }
    var first_key = ip+'::::'+user_agent;
    if (!report[first_key]) { report[first_key] = {}; }
    (report[first_key][url]) ? report[first_key][url]++ : report[first_key][url] = 1;
  });
}


// Оставляем только интересующие url
function is_not_interest_url (url) {
  var urls = { '/profile' : 1 };
  // console.log(url, urls[url]);
  return (!urls[url]) ? true : false;
}