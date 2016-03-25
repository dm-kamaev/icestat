#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// МЕТОДЫ работы с БАЗАМИ playlist_*


"use strict";

var db = require('/icestat/my/usedb.js');


// get_exist_tables('dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
function get_exist_tables (database, callback) {
  var query = "SHOW TABLES IN `playlist_"+database+"`";
  // console.log(query);
  db.read(query, function(err, res) {
    var Tables = {};
    if (!err) {
      for (var k = 0, L = res.length; k < L; k++) {
        var rd = res[k];
        Tables[rd['Tables_in_playlist_'+database]] = k;
      }
    }
    callback(err || null, Tables || null);
  });
}
exports.get_exist_tables = get_exist_tables;








