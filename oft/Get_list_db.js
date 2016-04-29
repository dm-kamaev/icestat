#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ПОЛУЧЕНИЕ СПИСКА БАЗ РАДИО

var CONF  = require('/icestat/config.js').settings();
var asc   = require(CONF.my_modules + 'asc.js');
var db    = require(CONF.my_modules + 'usedb.js');


// список баз plalist_* c помощью LIKE
// { 'playlist_icelogs.hostingradio.ru': 33, 'playlist_coffee.hostingradio.ru': 34, 'playlist_yam.hostingradio.ru': 35, 'playlist_mediamarkt.hostingradio.ru': 36, }
exports.databases_playlist_from_like = function (CONTEXT, callback) {
  var read = function(cb) {
    var query = "SHOW DATABASES LIKE 'playlist_%'";
    // console.log(query);
    db.read(query, function(err, res) {
      var Databases = {};
      // console.log(res); global.process.exit();
      if (!err) {
        for (var i = 0, l = res.length; i < l; i++) {
          var db_name = res[i]['Database (playlist_%)'];
          Databases[db_name] = i;
        }
      }
      cb(err || null, Databases || null);
    });
  };

  read(function(err, res) {
    if (!err) { CONTEXT.set('databases_playlist_from_like', res); }
    callback(err || null, 'Get_list_db.databases_playlist_from_like');
  });
};
// var CONTEXT = require('/icestat/my/context.js').add_set_get({});
// exports.databases_playlist_from_like(CONTEXT, function(err, res) {console.log(CONTEXT.get('databases_playlist_from_like'));});


// radio_name : radio_id
// { 'ftplog.hostingradio.ru': 185, 'blackstarradio.hostingradio.ru': 186, 'kpradio.hostingradio.ru': 189, Ъ
/*exports.radioName_id = function (CONTEXT, callback) {
  asc.series_move_data([
    (cbm) => { exports.databases_playlist_from_like(CONTEXT, cbm); },
    (cbm) => { get_list_table(CONTEXT, cbm);},
    (cbm, radio_names) => { get_radio_id(CONTEXT, radio_names, cbm);},
    ], function(err, res) {
      callback(err || null, 'Get_list_db.');
  });

  var get_list_table = function(CONTEXT, cb_main) {
    var res = [];
    var dbs_playlist_from_like = CONTEXT.get('databases_playlist_from_like'),
        dbs_name               = Object.keys(dbs_playlist_from_like);
    for (var i = 0, l = dbs_name.length; i < l; i++) { res.push(dbs_name[i].replace(/^playlist_/, '')); }
    cb_main(null, res, 'get_list_table');
  };

  var get_radio_id = function(CONTEXT, radio_names, cb_main) {
    var read = function(db_name, cb) {
      var query = "SELECT id FROM WHERE=`"+db_name+"`";
      db.read()
    };
    asc.ar_series(read, radio_names, function(err, res) {
      cb_main(err || null, 'get_list_table');
    });
  };
  // var read = function(cb) {
  //   var query = "SELECT id, ftp_username FROM icestat_management.stations";
  //   // console.log(query);
  //   db.read(query, function(err, res) {
  //     var Databases = {};
  //     if (!err) {
  //       for (var k = 0, L = res.length; k < L; k++) {
  //         var rd = res[k];
  //         Databases[rd.ftp_username+'.hostingradio.ru'] = rd.id;
  //       }
  //     }
  //     cb(err || null, Databases || null);
  //   });
  // };
  // read(function(err, res) {
  //   callback(err || null, 'Get_list_db.radioName_id');
  // });
};
var CONTEXT = require('/icestat/my/context.js').add_set_get({});
exports.radioName_id(CONTEXT, function(err, res) { console.log(CONTEXT.get('radioName_id')); });*/



exports.playlist = function (trigger_ignore, callback) {
  var query = "SELECT ftp_host FROM icestat_management.stations";
  // console.log(query);
  db.read(query, function(err, res) {
    var Databases = {};
    if (!err) {
      for (var k = 0, L = res.length; k < L; k++) {
        var rd = res[k], db_name = rd.ftp_host.replace(/\/log/, '');
        if (trigger_ignore) {
          if (skip_extra_playlist_db(db_name)) { Databases['playlist_'+db_name] = k; }
        } else {
          Databases['playlist_'+db_name] = k;
        }
      }
    }
    // console.log(Databases); global.process.exit();
    callback(err || null, Databases || null);
  });
};


// { 'playlist_icelogs.hostingradio.ru': 33, 'playlist_coffee.hostingradio.ru': 34, 'playlist_yam.hostingradio.ru': 35, 'playlist_mediamarkt.hostingradio.ru': 36, }
exports.databases_playlist = function (CONTEXT, trigger_ignore, callback) {
  exports.playlist(trigger_ignore, function(err, res) {
    if (!err) { CONTEXT.set('databases_playlist', res); }
    callback(err || null, 'Get_list_db.databases_playlist');
  });
};


// пропускаем все имена баз в icestat_managment, для которых не существует базы playlist_*
function skip_extra_playlist_db (db_name) {
  var ignore = {
    'bubukin' : 1,
    'cdn-1.radioday.fm' : 1, // TODO: УЗНАТЬ ЧТО ЭТО 4 РАДИО С НИМИ НЕ СОВПАДАЮТ НЕ ОДИН playlist
    'cdn-2.radioday.fm' : 1,
    'cdn-5.radioday.fm' : 1,
    'cdn-6.radioday.fm' : 1,
  };
  return (ignore[db_name]) ? false : true;
}