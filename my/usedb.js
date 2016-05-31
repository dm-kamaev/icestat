#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */

"use strict";

// МОДУЛЬ ДЛЯ РАБОТЫ с MySQL

var fs      = require('fs');
var mysql   = require('mysql');

var CONF = require('/icestat/config.js').settings();

var pool = mysql.createPool({
        connectionLimit: 10,
        host:     CONF.mysql_host,
        user:     CONF.mysql_user,
        password: CONF.mysql_password
});
exports.pool = pool;


function insert(q, callback) {
  pool.getConnection(function(err_connection, connection) {
    // Ошибка соединения
    if (err_connection) {
      // Append_in_File_Sync(
      //   '/r_m/nodejs/log/mysql.txt',
      //   Now_Time() + '\nОшибка ВСТАВКИ (Соединение): ' + err + '\n\n'
      // );
      callback(err_connection+' | '+q);
    } else {
        connection.query(q, function(err, rows) {
        // Освобождаем соединение
        connection.release();
        if (err) {
          // Append_in_File_Sync(
          //   '/r_m/nodejs/log/mysql.txt',
          //   Now_Time() + '\nОшибка ВСТАВКИ (Запрос): ' + err +
          //   '\n\nЗапрос (тело): ' + q +
          //   '\n\n'
          // );
          callback(err+' | '+q);
        } else {
          // Поле affectedRows после удачного INSERT или UPDATE
          // должно быть равно 1
          // console.log('', rows.affectedRows);
          callback(null, rows.affectedRows);
        }
      });
    }
  });
}

exports.insert = insert;


function read (q, callback) {
  pool.getConnection(function(err_connection, connection) {
    // ошибка соединения
    if (err_connection) {
      // Append_in_File_Sync('/r_m/nodejs/log/mysql.txt', Now_Time() + '\nОшибка ЧТЕНИЯ (Соединение): ' + err + '\n\n');
      callback(err_connection+' | '+q);
    } else {
        // console.log('The result is: ', rows);
        // row –– это массив, элементы которого хэши. Ключи хэша это поля,
        // по которым совершенна выборка, обратиться к ним можно следующим образом (строчка ниже)
        // console.log('The result is: ', rows[0].bank_id +'––'+ rows[0].bank_name);
        // console.time('Time query_read');
        connection.query(q, function(err, rows) {
          connection.release();
          // ошибка запроса
          if (err) {
            // Append_in_File_Sync('/r_m/nodejs/log/mysql.txt', Now_Time() + '\nОшибка ЧТЕНИЯ (Запрос): ' + err + '\n\n');
            callback(err+' | '+q);
          } else {
             // console.timeEnd('Time query_read');
             callback(null, rows);
          }
        });
      }
  });
}
exports.read = read;


function connection_end (callback) {
   pool.end();
   if (callback) {callback(null);}
}
exports.connection_end = connection_end;


// экранирование ' и \
// console.log("'He\\llo'");
// console.log(escape("'He\\llo'"));
function escape (data) {
  data = data.replace(/\\/g, "\\\\");
  data = data.replace(new RegExp('\'', 'g'), "\'\'");
  // $v=~s/\\/\\\\/go;
  // $v=~s/\'/\'\'/go;
  return data;
}
exports.escape = escape;


function ar_q_ins(ar_q, callback) {
  // Формируем массив анонимных функций (вставка в базу)
  var Series_Arr = [];
  for (var k = 0, l = ar_q.length; k < l; k++) {
    (function(query) {
      Series_Arr.push(function(cb) {
        insert(query, cb);
      });
    }(ar_q[k]));
  }

  asc.series(
    Series_Arr, function(err, result) {
      // это логи каждой вставки
      // console.log('async series done:', err || result);
      callback(err || null, null);
    }
  );
}

exports.ar_q_ins = ar_q_ins;



/**
 * Append_in_File_Sync description –– функция дозаписи в файл (СИНХРОННАЯ)
 * @param  type –– string f_path [ Путь до файла ]
 * @param  type –– string data   [ Данные для записи ]
 */
function Append_in_File_Sync(f_path, data) {
    fs.appendFileSync(f_path, data+'\n\n','utf8');
}

exports.Append_in_File_Log_Mysql = Append_in_File_Sync;

// TODO: Вынести в отедльный модуль
/**
 * Now_Time –– функция, определяющая текущий год, месяц и день. В формате:
 * ГГГГ.ММ.ДД. Через тире дается время в часах,минутах и секундах. В формате:
 * ЧЧ:ММ:СС . Затем делает return данной строки.
 */
function Now_Time() {
  var now_time = new Date();
  var sec = now_time.getSeconds(); // Секунды
  var min = now_time.getMinutes(); // Минуты
  var hour = now_time.getHours(); // Часы

  var day = now_time.getDate(); // День
  var month = now_time.getMonth() + 1; // Месяц
  var year = now_time.getFullYear(); // Год

  if (sec < 10) {
    sec = '0' + sec;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (hour < 10) {
    hour = '0' + hour;
  }

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }

  var data =
    ' Дата: ' + year + '.' + month + '.' + day +
    ' Время: ' + hour + ':' + min + ':' + sec;

  return data;
}

exports.Now_Time = Now_Time;