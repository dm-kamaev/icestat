/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// Promise(function(next) {
//   setTimeout(function() {
//     // next('error_sync func_1', 'sync func_1');
//     next(null, 'sync func_1');
//   }, 2500);
// }).then(function (next) {
//   setTimeout(function () {
//     next(null, 'sync func_2');
//   }, 500);
// }).end(function(err, res) {
//   console.log('That"s all:', err || res)
// });

// // ОРГАНИЗАЦИЯ ЦИКЛА
// var promise = Promise();
// var ar = ['sync func_1', 'sync func_2', 'sync func_3'];
// for (var i = 0, l = ar.length; i < l; i++) {
//   let text = ar[i];
//   promise.then(function(next) {
//     setTimeout(function() {
//       next(null, text);
//     }, 1000);
//   });
// }
// promise.end(function(err, res) {
//   console.log('That"s all:', err || res);
// });

var CPromise = function (fn) {
  "use strict";
  var line_fns = [];

  if (fn) {
    // console.log('start');
    line_fns.push(function(cb) {
      fn(resolve(cb));
    });
  }


  var resolve = function (cb) {
    return function (err, data) {
      // console.log(err || data);
      cb(err || null, data || null);
    };
  };

  // Когда первый вызов функции, происходит так: Promise.start(fn)
  // function start (fn) {
  //   console.log('start');
  //   line_fns.push(function (cb) {
  //     fn(resolve(cb));
  //   });
  //   return init;
  // }

  var then = function (fn) {
    line_fns.push(function(cb) {
      fn(resolve(cb));
    });
    return init;
  };

  var end = function (finish_callback) {
    var f_array =  line_fns;
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
        setTimeout(function() {
          el_array(internal_callback);
        }, 0); // Передаем только internal_callback потому что первый параметр j (уже присутствует значения)
      } else {
        finish_callback(null, result);
      }
    };

    internal_callback();
  };



  var init = {
    // start: start,
    then: then,
    end: end,
  };
  return init;
};