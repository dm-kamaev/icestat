#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */

"use strict";

// МОДУЛЬ для работы с собственной АСИНХРОННОЙ СЕРИЕЙ и т.д.


/**
 * series - функции в которой последовательно вызываются async функции из массива
 * и отрабатываются по очередно.
 * @param  {[массив]}  f_array         [массив async функций]
 * @param  {[функция]} finish_callback [это главный callback для все серии]
 */
function series(f_array, finish_callback) {

  var result  = [],
      current = 0,
      finish  = f_array.length;

  var internal_callback = function(err, data) {

    // data –– это данные, которые возвращает callback из вызванной функции из массива
    if (data || data === 0) {
      result.push(data);
    }
    if (err) {
      finish_callback(err); // Если ошибка, взываем главный callback серии
    } else if (current < finish) { // Пока не кончился массив берем элемент массива (функцию)
      var el_array = f_array[current];
      current++;
      setImmediate(function() {
        el_array(internal_callback);
      }); // Передаем только internal_callback потому что первый параметр j (уже присутствует значения)
    } else {
      finish_callback(null, result);
    }
  };

  internal_callback();

}
exports.series = series;

// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// series([
//   function(cb_main) {
//     setTimeout(function() {console.log('1');cb_main(null, 'ok')},1000);
//   },
//   function(cb_main) {
//     setTimeout(function() {console.log('2');cb_main(null, 'ok')},1000);
//   },
//   function(cb_main) {
//     setTimeout(function() {console.log('3');cb_main(null, 'ok')},1000);
//   },
//   ], function(err, result) {
//   console.log(err || null, result || null);
// });

// ПРИМЕР БОЛЕЕ СЛОЖНЫЙ РАБОТЫ С SERIES
// var cb = function(n, int) {
//   console.log('number = ', n);
//   int(null, n);
// };
// var ar = [];
// for (var i = 0, l = 5; i < l; i++) {
//   (function(j) {
//     ar.push(function(int) {
//       // console.log(int);
//       setTimeout(function() {cb(j, int);}, 1000);
//       // cb(j, int);
//     });
//   }(i));
// }
// console.log(ar);

// series(ar, function(err, data) {
//   console.log('data = ', err || data);
// });

/* ПАТТЕРН ВЫЗОВА
var my_stat = function (path, cb) {
  fs.stat(path, function(err, stats) {
    if (!err) {
      determine_stats(path, stats, cb);
    } else {
      callback_main(err, null);
    }
  });
};

asc.ar_series(my_stat, array_path, function(err, result) {
  callback_main(err || null, result || null);
});
*/
// func – функция асинх,
// ar_param –– параметр для функции,
// ext_cb –– внешний callback
function ar_series(func, ar_param, ext_cb) {
  // Формируем массив анонимных функций
  var Series_Arr = [];
  for (var k = 0, l = ar_param.length; k < l; k++) {
    (function(param) {
      Series_Arr.push(function(cb) {
        func(param, cb);
      });
    }(ar_param[k]));
  }

  series(
    Series_Arr, function(err, result) {
      // это логи каждой вставки
      // console.log('myasync series done:', err || result);
      ext_cb(err || null, result || null);
    }
  );
}
exports.ar_series = ar_series;






function series_move_data(f_array, finish_callback) {

  var result  = [],
      current = 0,
      finish  = f_array.length;

  var internal_callback = function(err, move_data, data) {

    // move_data –– это данные, которые передаем из текущей функции в следующую функцию
    // data      –– это данные, которые возвращает callback из вызванной функции из массива
    if (move_data && !data) { // вызываем без передачи данных
      if (move_data || move_data === 0) {
        result.push(move_data);
      }
    } else if (move_data && data) {
     if (data || data === 0) { // вызываем с передачей данных
       result.push(data);
     }
    }
    if (err) {
      finish_callback(err); // Если ошибка, взываем главный callback серии
    } else if (current < finish) { // Пока не кончился массив берем элемент массива (функцию)
      var el_array = f_array[current];
      current++;
      setImmediate(function() {
        el_array(internal_callback, move_data); // передаем данные в следующую функцию
      }); // Передаем только internal_callback потому что первый параметр j (уже присутствует значения)
    } else {
      finish_callback(null, result);
    }
  };

  internal_callback();

}
exports.series_move_data = series_move_data;

// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// series_move_data([
//   function(cb_main) {
//     setTimeout(function() {console.log('1');cb_main(null, {status: 'error'}, 'ok 1')},1000);
//   },
//   function(cb_main, data) {
//     setTimeout(function() {console.log(data);cb_main(null, 'ok 2')},1000);
//   },
//   function(cb_main) {
//     setTimeout(function() {console.log('3');cb_main(null, 'ok 3')},1000);
//   },
//   ], function(err, result) {
//   console.log(err || null, result || null);
// });