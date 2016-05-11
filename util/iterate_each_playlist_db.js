#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ПРОЙТИ ПО ВСЕМ БАЗАМ playlist_* И ВСЕ ТАБЛИЦАМ YYYY-MM-DD ДОБАВИТЬ поля author and song_name

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc.js');
var db    = require(CONF.my_modules + 'usedb.js');
var fs    = require('fs');

var Get_list_db  = require(CONF.oft_modules + 'Get_list_db.js');
var Get_exist_tb = require(CONF.oft_modules + 'Get_exist_tb.js');


// playlist_xmusicradio.hostingradio.ru –– проблемное радио
// start();
// ---------------------------------------------------------------------------------------------------
function start () {
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  asc.series([
    (cbm) => { Get_list_db.databases_playlist_from_like(CONTEXT, cbm); },
    (cbm) => { get_tables_for_each_playlist_radio(CONTEXT,cbm); },
    // (cbm) => { add_author_songName(CONTEXT, cbm); },
    // (cbm) => { add_index_by_in_playlist(CONTEXT, cbm); },
    // (cbm) => { order_desc_by_date(CONTEXT, cbm); },
    ],function(err, result) {
      // console.log(CONTEXT.get('databases_playlist_from_like'));
      // console.log(CONTEXT.get('db_listTables')['playlist_xmusicradio.hostingradio.ru']);
      console.log('\n\n async ITERATE_EACH_PLAYLIST_DB.JS series dine: ', err || result);
  });
}
// ---------------------------------------------------------------------------------------------------


// databases_playlist_from_like –– { 'playlist_ilikeradio.df6.ru': 71, 'playlist_iskatel.hostingradio.ru': 72, 'playlist_xmusicradio.hostingradio.ru': 73 }
// db_listTables      –– { 'playlist_bfm.hostingradio.ru': { '2015-12-31': 0,'2016-01-01': 1, '2016-01-02': 2, '2016-01-03': 3, }, ... }
function get_tables_for_each_playlist_radio (CONTEXT, cb_main) {
  var db_listTables = {};
  var read = function (db_name, cb) {
    Get_exist_tb.get_list_tables(db_name, function(err, res) {
      if (!err) { db_listTables[db_name] = res; }
      cb(err || null, null);
    });
  };
  asc.ar_series(read, Object.keys(CONTEXT.get('databases_playlist_from_like')), function(err, res) {
    if (!err) { CONTEXT.set('db_listTables', db_listTables); }
    cb_main(err || null, 'get_tables_for_each_playlist_radio');
  });
}


// db_listTables      –– { 'playlist_bfm.hostingradio.ru': { '2015-12-31': 0,'2016-01-01': 1, '2016-01-02': 2, '2016-01-03': 3, }, ... }
// ALTER TABLE `xmusicradio.hostingradio.ru`.`2016-04-17` ADD COLUMN author VARCHAR(300) NULL DEFAULT '', song_name VARCHAR(300) NULL DEFAULT '';
function add_author_songName (CONTEXT, cb_main) {
  // CONTEXT['db_listTables'] =
  // { 'playlist_xmusicradio.hostingradio.ru': { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10, '2016-04-09': 11, '2016-04-10': 12, '2016-04-11': 13, '2016-04-12': 14,
  //   '2016-04-13': 15,  '2016-04-14': 16,  '2016-04-15': 17,  '2016-04-16': 18,  '2016-04-17': 19,  '2016-04-18': 20,  '2016-04-19': 21
  // }};
  var db_listTables = CONTEXT.get('db_listTables'), dbs_name = Object.keys(db_listTables),  queries = [];
  for (var i = 0, l = dbs_name.length; i < l; i++) {
    var db_name = dbs_name[i];
    // if (db_name !== 'playlist_dorognoe.hostingradio.ru') { continue; }
    var hash_dates = db_listTables[db_name], dates = Object.keys(hash_dates);
    for (var j = 0, l1 = dates.length; j < l1; j++) {
      var date = dates[j];
      queries.push(
        "ALTER TABLE `"+db_name+"`.`"+date+"` ADD COLUMN author VARCHAR(300) NULL DEFAULT '' "
      );
      queries.push(
        "ALTER TABLE `"+db_name+"`.`"+date+"` ADD COLUMN song_name VARCHAR(300) NULL DEFAULT '' "
      );
    }
  }
  // console.log('queries= ', queries); global.process.exit();
  var add_fileds = function (query, cb) {
    db.insert(query, function(err, res) {
      if (err) { console.log('ADD_AUTHOR_SONGNAME: ERROR => ', err); }
      cb(null, null);
    });
  };
  asc.ar_series(add_fileds, queries, function(err, res) {
    console.log(err || res);
    cb_main(err || null, 'add_author_songName');
  });
}


// db_listTables      –– { 'playlist_bfm.hostingradio.ru': { '2015-12-31': 0,'2016-01-01': 1, '2016-01-02': 2, '2016-01-03': 3, }, ... }
// ALTER TABLE `xmusicradio.hostingradio.ru`.`2016-04-17` ADD COLUMN author VARCHAR(300) NULL DEFAULT '', song_name VARCHAR(300) NULL DEFAULT '';
function add_index_by_in_playlist (CONTEXT, cb_main) {
  // CONTEXT['db_listTables'] =
  // { 'playlist_xmusicradio.hostingradio.ru': { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10, '2016-04-09': 11, '2016-04-10': 12, '2016-04-11': 13, '2016-04-12': 14,
  //   '2016-04-13': 15,  '2016-04-14': 16,  '2016-04-15': 17,  '2016-04-16': 18,  '2016-04-17': 19,  '2016-04-18': 20,  '2016-04-19': 21
  // }};
  var db_listTables = CONTEXT.get('db_listTables'), dbs_name = Object.keys(db_listTables),  queries = [];
  for (var i = 0, l = dbs_name.length; i < l; i++) {
    var db_name = dbs_name[i];
    if (db_name !== 'playlist_stream01.chameleon.fm') { continue; }
    var hash_dates = db_listTables[db_name], dates = Object.keys(hash_dates);
    for (var j = 0, l1 = dates.length; j < l1; j++) {
      var date = dates[j];
      queries.push("ALTER TABLE `"+db_name+"`.`"+date+"` ADD INDEX id (id)");
    }
  }
  // console.log('queries= ', queries); global.process.exit();
  var add_fileds = function (query, cb) {
    db.insert(query, function(err, res) {
      if (err) { console.log('ADD_INDEX_BY_IN_PLAYLIST: ERROR => ', err); }
      cb(null, null);
    });
  };
  asc.ar_series(add_fileds, queries, function(err, res) {
    console.log(err || res);
    cb_main(err || null, 'add_index_by_in_playlist');
  });
}


function order_desc_by_date (CONTEXT, cb_main) {
  // CONTEXT['db_listTables'] =
  // { 'playlist_xmusicradio.hostingradio.ru': { '2016-03-29': 0, '2016-03-30': 1, '2016-03-31': 2, '2016-04-01': 3, '2016-04-02': 4, '2016-04-03': 5, '2016-04-04': 6, '2016-04-05': 7, '2016-04-06': 8, '2016-04-07': 9, '2016-04-08': 10, '2016-04-09': 11, '2016-04-10': 12, '2016-04-11': 13, '2016-04-12': 14,
  //   '2016-04-13': 15,  '2016-04-14': 16,  '2016-04-15': 17,  '2016-04-16': 18,  '2016-04-17': 19,  '2016-04-18': 20,  '2016-04-19': 21
  // }};
  var db_listTables = CONTEXT.get('db_listTables'), dbs_name = Object.keys(db_listTables),  queries = [];
  for (var i = 0, l = dbs_name.length; i < l; i++) {
    var db_name = dbs_name[i];
    // if (db_name !== 'playlist_stream01.chameleon.fm') { continue; }
    var hash_dates = db_listTables[db_name], dates = Object.keys(hash_dates);
    for (var j = 0, l1 = dates.length; j < l1; j++) {
      var date = dates[j];
      queries.push("ALTER TABLE `"+db_name+"`.`"+date+"`  ORDER BY date DESC");
    }
  }
  // console.log('queries= ', queries); global.process.exit();
  var add_fileds = function (query, cb) {
    db.insert(query, function(err, res) {
      console.log(query);
      if (err) { console.log('ORDER_DESC_BY_DATE: ERROR => ', err); }
      cb(null, null);
    });
  };
  asc.ar_series(add_fileds, queries, function(err, res) {
    console.log(err || res);
    cb_main(err || null, 'ORDER_DESC_BY_DATE');
  });
}