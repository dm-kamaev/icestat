#!/usr/local/bin/node
"use strict";
var my_sql=require('/icestat/node_test/sql.js');

//req('stations_dorognoe.hostingradio.ru', function(err, data) { console.log(err||data); });
////////////////////////////////////
exports.req = function(db, callback) {
  my_sql.query("SHOW TABLES IN `" + db + "`", function(err, mysql_res) {
    if (!err) {
      var Tables = {};
      for (var k = 0, L = mysql_res.length; k < L; k++) {
        var rd = mysql_res[k];
        Tables[rd['Tables_in_' + db]] = k;
      }
      callback(null, Tables);
    } else {
      callback(err);
    }
  });
}






