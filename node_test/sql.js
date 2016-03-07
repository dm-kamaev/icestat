#!/usr/local/bin/node
"use strict";
var mysql = require('/usr/local/lib/node_modules/mysql');
var pool  = mysql.createPool({ host : '95.213.143.80', user : 'root', password : 'ohbae5Oo' });


////////////////////////////////////
// ошибки базы обрабатываем здесь,  а также обеспечиваем всплытие ошибки, для правильной реакции вышестоящего кода)
function query(req, mysql_callback) {
  pool.getConnection(function(err_connection, connection) {
    if (err_connection) { // проблемы с соединением
      //my_util.process_err('sql.query', ' DB error: '+err_connection+' | '+req);
      mysql_callback(err_connection + ' | ' + req);

    } else {
      connection.query(req, function(err, rows) { // Use the connection
        connection.release(); // And done with the connection.

        if (err) {
          //my_util.process_err('sql.query', ' DB error: '+err);
          mysql_callback(err + ' | ' + req);
        } else {
          mysql_callback(null, rows);
        }
      });
    }
  });
}
exports.query = query;
////////////////////////////////////
// all connections in the pool have ended
function end() {
  pool.end(function (err) {
    //console.log('all connections in the pool have ended');  // , pool
  });
}
exports.end=end;

////////////////////////////////////
var ch_for_db = str => str.replace(/\\/g,"\\").replace(/\'/g,"''");
exports.ch_for_db=ch_for_db;
////////////////////////////////////





