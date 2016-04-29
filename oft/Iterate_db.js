#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ПЕРЕБРАТЬ ВСЕ БАЗЫ

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc.js');
var db    = require(CONF.my_modules + 'usedb.js');

var Get_list_db  = require(CONF.oft_modules + 'Get_list_db.js');
var Get_exist_tb = require(CONF.oft_modules + 'Get_exist_tb.js');


// проходим по всем базам playlist_* и вытаскиваем все таблицы
// {'playlist_yuradio.hostingradio.ru':  { '2015-12-31': 0,}, ... }
// наружу db_listTables
exports.get_eachPlaylist_eachTables = function (CONTEXT, callback) {
  asc.series([
    (cbm) => { Get_list_db.databases_playlist_from_like(CONTEXT, cbm); },
    (cbm) => { get_tables_for_each_playlist_radio(CONTEXT,cbm); },
    ],function(err, result) {
      // console.log(CONTEXT.get('databases_playlist_from_like'));
      // console.log(CONTEXT.get('db_listTables')['playlist_xmusicradio.hostingradio.ru']);
      // console.log('\n\n async ITERATE_EACH_PLAYLIST_DB.JS series dine: ', err || result);
      console.log('HERE');
      callback(err || null, 'Iterate_db.get_eachPlaylist_eachTables');
  });
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({});
// exports.get_eachPlaylist_eachTables(CONTEXT, function(err, res) { console.log(CONTEXT.get('db_listTables')); });


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
