#!/usr/local/bin/node
"use strict";

var db = require('/icestat/my/usedb.js');

// req('stations_dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
function get (database, callback) {
  db.read("SHOW TABLES IN `"+database+"`", function(err, res) {
    var Tables = {};
    if (!err) {
      for (var k = 0, L = res.length; k < L; k++) {
        var rd = res[k];
        Tables[rd['Tables_in_'+database]] = k;
      }
    }
    callback(err || null, Tables || null);
  });
}
exports.get = get;





