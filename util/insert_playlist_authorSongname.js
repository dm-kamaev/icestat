#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// ВСТАВКА в playlist_* author and song_name, КОТОРЫЕ ПОЛУЧЕНЫ ИЗ ФАЙЛОВ downloads/*/playlist.log

var CONF  = require('/icestat/config.js').settings();
var fs    = require('fs');
var db    = require(CONF.my_modules + 'usedb.js');
var asc   = require(CONF.my_modules + 'asc.js');
var wf    = require(CONF.my_modules + 'wf.js');
var files = require(CONF.my_modules + 'files.js');
var fn    = require(CONF.my_modules + 'fn.js');

var Get_list_db = require(CONF.oft_modules + 'Get_list_db.js');
var Iterate_db  = require(CONF.oft_modules + 'Iterate_db.js');


// start();
// ---------------------------------------------------------------------------------------------------
function start () {
  var CONTEXT = require('/icestat/my/context.js').add_set_get({});
  asc.series([
    (cbm) => { get_list_playlistLog(CONTEXT, cbm); },
    (cbm) => { read_playlistLog(CONTEXT, cbm); },
    (cbm) => { Iterate_db.get_eachPlaylist_eachTables(CONTEXT, cbm); },
    (cbm) => { update_authorSongName(CONTEXT, cbm); },
    ],function(err, result) {
      // console.log(CONTEXT.get('list_playlistLog'));
      // console.log(CONTEXT.get('all_radio_playlist'));
      // db.connection_end();
      console.log('\n\n async INSERT_PLAYLIST_AUTHORSONGNAME.JS series dine: ', err || result);
  });
}
// ---------------------------------------------------------------------------------------------------


// формируем список путей к файлам с исходными данными о песнях
// folders –– [ '/icestat/downloads/68_bookradio.hostingradio.ru', '/icestat/downloads/88_jfm.jazzandclassic.ru' ]
// list_playlistLog –– [ '/icestat/downloads/101_nashe1.hostingradio.ru/playlist.log', '/icestat/downloads/106_ep128.hostingradio.ru/playlist.log', '/icestat/downloads/111_hrradio.hostingradio.ru/playlist.log', ]
function get_list_playlistLog (CONTEXT, cb_main) {
  files.get_list_folders('/icestat/downloads/', function(err, folders) {
    var playlist = [];
    if (!err) {
      fn.foreach_value(folders, function(folder) {
        // if (folder !== '/icestat/downloads/228_xmusicradio.hostingradio.ru') { return; }
        playlist.push(folder+'/playlist.log');
      });
      CONTEXT.set('list_playlistLog', playlist);
    }
    cb_main(err || null, 'get_list_playlistLog');
  });
}


// Строим один хэш песен из всех playlist для всех радио
// list_playlistlog ––
// all_radio_playlist –– key is author and songname without separate, value is author and songname with separate
// { 'Noir, Lomez, Atnarko Feat. Symbol  Lost Again (Original Mix)': 'Noir, Lomez, Atnarko Feat. Symbol - Lost Again (Original Mix)' } }
function read_playlistLog (CONTEXT, cb_main) {
  var data = {};
  var read = function(path, cb) {
    wf.read_file(path, function(err, from_file) {
      if (!err) {
        var lines = from_file.split(/\n/);
        for (var i = 0, l = lines.length; i < l; i++) {
          var line     = lines[i],
              elements = line.split('|'), authorSong_name = elements[3];
          if (authorSong_name && !/^\s+$/.test(authorSong_name)) {
            var key   = authorSong_name.replace(/-/, '').replace(/\s+/g, ' ').trim();
            data[key] = authorSong_name.replace(/^\s*-/, '').replace(/\s+/g, ' ').trim();
          }
        }
      } else {
        console.log('READ_PLAYLISTLOG: ERROR => ', err);
      }
      cb(null, null);
    });
  };
  asc.ar_series(read, CONTEXT.get('list_playlistLog'), function(err, res) {
    if (!err) {
      CONTEXT.set('all_radio_playlist', data);
/*      fn.each(data, function(key, value) {
        // if (/Mark Ronson Uptown Funk (ft. Bruno Mars)/ig.test(key)) {
        // if (/Bruno Mars/ig.test(key)) {
          console.log('-----------------------------------');
          console.log('|'+key+'|');
          console.log('|'+value+'|');
          console.log('-----------------------------------');
        // }
      });*/
    }
    cb_main(err || null, 'read_playlistLog');
  });
}


// db_listTables –– {'playlist_yuradio.hostingradio.ru':  { '2015-12-31': 0,}, ... }
// all_radio_playlist –– { 'Noir, Lomez, Atnarko Feat. Symbol  Lost Again (Original Mix)': 'Noir, Lomez, Atnarko Feat. Symbol - Lost Again (Original Mix)' } }
function update_authorSongName (CONTEXT, cb_main) {
  var db_listTables = CONTEXT.get('db_listTables'), db_names = Object.keys(db_listTables);
  var queries = [], all_radio_playlist = CONTEXT.get('all_radio_playlist');
  for (var i = 0, l = db_names.length; i < l; i++) {
    var db_name = db_names[i], dates = db_listTables[db_name], kdates = Object.keys(dates);
    for (var j = 0, l1 = kdates.length; j < l1; j++) {
      var date = kdates[j];
      queries.push([db_name, date]);
    }
  }

  var read = function(params, cb) {
    var db_name = params[0], date = params[1];
    var query = "SELECT id, meta, author, song_name FROM `"+db_name+"`.`"+date+"`";
    // if (db_name !== 'playlist_xmusicradio.hostingradio.ru') { cb(null, null); return;}
    // if (db_name !== 'playlist_yuradio.hostingradio.ru') { cb(null, null); return;}
    // if (db_name !== 'playlist_stream01.chameleon.fm') { cb(null, null); return;}
    // if (db_name !== 'playlist_yumfm.hostingradio.ru') { cb(null, null); return;}
    // console.log(db_name);
    if (
       db_name !== 'playlist_stream01.chameleon.fm'
       // db_name !== 'playlist_stream.deep1.ru'
       // db_name !== 'playlist_svyaznoy.hostingradio.ru'
       // db_name !== 'playlist_vdvradio.hostingradio.ru'
       // db_name !== 'playlist_vesnafm.hostingradio.ru'
       // db_name !== 'playlist_vgtrk15.hostingradio.ru'
       // db_name !== 'playlist_voicemaikop.hostingradio.ru'
       // db_name !== 'playlist_vostokfm.hostingradio.ru'
       // db_name !== 'playlist_xmusicradio.hostingradio.ru'
       // db_name !== 'playlist_yumfm.hostingradio.ru'
    ) { console.log('HHHH');cb(null, null); return;}
    db.read(query, function(err, res) {
      // console.log(res);global.process.exit();
      if (!err) {
        who_need_update(res, all_radio_playlist, db_name, date, cb);
      } else {
        cb(err, null);
      }

    });
  };
  asc.ar_series(read, queries, function(err, res) {
    cb_main(err || null, 'update_authorSongName');
    // cb_main(null, 'update_authorSongName');
  });
}


function who_need_update (res, all_radio_playlist, db_name, date, cb) {
  var q_inst = [];
  for (var i = 0, l = res.length; i < l; i++) {
    var song = res[i];
    if (!all_radio_playlist[song.meta]) {
      // проблемные песни и авторы для них нет данных для update
      console.log('////////////////////////////////');
      console.log('|'+song.meta+'|');
      console.log('|'+all_radio_playlist[song.meta]+'|');
      continue;
    } else {
      if (song.author && song.song_name) {
        console.log('Exist date by:', db_name, date, song.id);
        continue;
      }
      // TODO: Сделать проверку существования meta and author перед update
      var authorSong_name = all_radio_playlist[song.meta].split('-');
      var author          = (authorSong_name[0]) ? authorSong_name[0].trim() : '';
      var song_name       = (authorSong_name[1]) ? authorSong_name[1].trim() : '';
      q_inst.push(
        "UPDATE `"+db_name+"`.`"+date+"` SET author='"+db.escape(author)+"', song_name='"+db.escape(song_name)+
        "' WHERE id="+song.id+""
      );
      console.log('////////////////////////////////');
      console.log(song.meta);
      console.log(all_radio_playlist[song.meta]);
    }
  }
  // console.log(q_inst);
  // console.log('UPDATE database: ', db_name, date);
  asc.ar_series(db.insert, q_inst, function(error, res) {
    console.log('UPDATE database: ', db_name, date);
    cb(error || null, null);
  });
}