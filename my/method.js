#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */

"use strict";

// МЕТОДЫ –– ОБЕРТКИ

// ПОКА НЕ ИСПОЛЬЗУЮ
// console.log(join_array(['привет','привет','привет','привет','привет','привет', ''], 120));
// массив (например, слов);
// сколько элементов из массива надо склеить;
// опциональный разделитель
function join_array (array, count_el, sep) {
  var res = '';
  if (array.length < count_el) {count_el = array.length-1;}
  sep = (sep) ? sep : ' ';
  var search_sep = new RegExp(sep + '$');
  for (var i = 0, l = count_el; i <= l; i++) {
    var el = array[i];
    if (i === count_el && el !== undefined) {res += el; break;}
    if (el)                                 {res += el + sep;}
  }
  // если last el is '', то останется sep от предыдущего элемента
  res = res.replace(search_sep, '');
  return res;
}
exports.join_array = join_array;


// паттерн: добавление данных в новый массив
// var new_ar = [];
// foreach([1, 2, ''], function(el) {
//   new_ar.push(el);
// });
// console.log(new_ar);

// паттерн: добавление данных в тот же массив
// var ar = [1, 2, ''];
// foreach(ar, function(el) {
//   return 'ok';
// });
// console.log(ar);
// ДЛЯ ПУСТОЙ СТРОКИ НЕ СРАБОТАЕТ CALLBACK!!!!
function foreach (array, cb) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      var new_el = cb(el);
      if (new_el) {array[i] = new_el;}
    }
  }
}
exports.foreach = foreach;


// var new_arr = gen_reduce()([0, 2, '', 4], function(el) {
//   if (el !== 2) return el;
// });
// console.log(new_arr);
// Внутри callback должен быть return
// ДЛЯ ПУСТОЙ СТРОКИ НЕ СРАБОТАЕТ CALLBACK!!!!
function gen_reduce (res) {
  if (!res) {res = [];}
  return function  (array, cb) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        var new_el = cb(el);
        if (new_el !== undefined){res.push(new_el);}
      }
    }
    return res;
  };
}
exports.gen_reduce = gen_reduce;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = map([1,2,3], function(el) {
//   return el*el;
// });
// console.log(new_ar);
// ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
// ПРОПУСКАЕТ ЕСЛИ ЕЛЕМЕНТ МАССИВА ПУСТАЯ СТРОКА
function map (array, cb) {
  var res = [];
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      var new_el = cb(el);
      if (new_el !== undefined) {res.push(new_el);}
    }
  }
  return res;
}
exports.map = map;
