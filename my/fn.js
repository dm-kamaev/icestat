#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */

"use strict";

// ФУНКЦИОЛЬНЫЕ МЕТОДЫ (ИЛИ ОКОЛО ТОГО)
// ЗАМЕНА МОДУЛЮ method.js

// var ar = [1,2,3, '', null, undefined];
// foreach(ar, function(el) {
//   console.log(el+1);
// });
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function foreach (array, cb) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {cb(el);}
  }
}
exports.foreach = foreach;


// var ar = [1,2,3, '', null, undefined];
// foreach(ar, function(el) {
//   console.log(el+1);
// });
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function foreach_value (array, cb) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {cb(el);}
  }
}
exports.foreach_value = foreach_value;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = map([1,2,3], function(el) {
//   return el*el;
// });
// console.log(new_ar);
// ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function map (array, cb) {
  var res = [];
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      var new_el = cb(i, el);
      if (new_el !== undefined) {res.push(new_el);}
    }
  }
  return res;
}
exports.map = map;



// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = map([1,2,3], function(el) {
//   return el*el;
// });
// console.log(new_ar);
// ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function map_value (array, cb) {
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
exports.map_value = map_value;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = map_object({'Hello' : 'world', test:'123'}, function(el) {
//   return el*el;
// });
// console.log(new_ar);
// ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
function map_object (obj, cb) {
  var res = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var new_el = cb(key, obj[key]);
      if (new_el !== undefined) {res.push(new_el);}
    }
  }
  return res;
}
exports.map_object = map_object;


// var ar = [1, 2, 3];
// var sum = reduce(ar, function(res, i, el) {
//   return res + el;
// }, '');
// console.log(sum);
// ВНИМАНИЕ С ТИПА ДАННЫХ: ТУТ ЛИБО ВСЕ СТРОКИ НА ВЫХОД, ЛИБО ЧИСЛА
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
// res –– стартовая сумма, если это число, то все будет обрабатываться как числа, если строка,
// то как строки
function reduce (array, cb, res) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {res = cb(res, i, el);}
  }
  return res;
}
exports.reduce = reduce;


// var ar = [1, 2, 3];
// var sum = reduce_value(ar, function(res, el) {
//   return res + el;
// }, '');
// console.log(sum);
// ВНИМАНИЕ С ТИПА ДАННЫХ: ТУТ ЛИБО ВСЕ СТРОКИ НА ВЫХОД, ЛИБО ЧИСЛА
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
// res –– стартовая сумма, если это число, то все будет обрабатываться как числа, если строка,
// то как строки
function reduce_value(array, cb, res) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {res = cb(res, el);}
  }
  return res;
}
exports.reduce_value = reduce_value;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = filter([1,2,3], function(el) {
//   return el < 3;
// });
// console.log(new_ar);
// ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function filter (array, cb) {
  var res = [];
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      if (cb(el) === true) {res.push(el);}
    }
  }
  return res;
}
exports.filter = filter;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = every([5, 5, 6, 5], function(el) {
//   return el === 5;
// });
// console.log(new_ar);
// ВЕРНЕТ TRUE, ЕСЛИ ВСЕ ЭЛЕМЕНТЫ МАССИВА УДОВЛЕТВОРЯЮТ УСЛОВИЮ
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function every (array, cb) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      if (cb(el) !== true) {return false;}
    }
  }
  return true;
}
exports.every = every;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var new_ar = some([7, 7, 6, 5], function(el) {
//   return el === 6;
// });
// console.log(new_ar);
// ВЕРНЕТ TRUE, ЕСЛИ ХОТЯ БЫ ОДИН ЭЛЕМЕНТ МАССИВА УДОВЛЕТВОРЯЕТ УСЛОВИЮ
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function some (array, cb) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      if (cb(el) === true) {return true;}
    }
  }
  return false;
}
exports.some = some;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var res = search_in_obj({'Hello': 'world', 'Vasya': 'Petya'}, function(key, value) {
//   return (key === 'Hello') ? value : false;
// });
// console.log(res);
// ИЩЕТ В ОБЪЕКТЕ ЭЛЕМЕНТ УДОВЛЕТВОРЯЮЩИЙ УСЛОВИЮ И СРАЗУ ВОЗВРАЩАЕТ ЕГО
function search_in_obj (obj, cb) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var res = cb(key, obj[key]);
      if (res) return res;
    }
  }
  return null;
}
exports.search_in_obj = search_in_obj;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// var res = search_in_obj(['Hello', 'world', 'Vasya', 'Petya'], function(i, el) {
//   return (el === 'Vasya') ? i : false;
// });
// console.log(res);
// ИЩЕТ В МАССИВЕ ЭЛЕМЕНТ УДОВЛЕТВОРЯЮЩИЙ УСЛОВИЮ И СРАЗУ ВОЗВРАЩАЕТ ЕГО
// ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
function search_in_array (array, cb) {
  for (var i = 0, l = array.length; i < l; i++) {
    var el = array[i];
    if (el || el === 0) {
      var res = cb(i, el);
      if (res) return res;
    }
  }
  return null;
}
exports.search_in_array = search_in_array;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// each({1: 'Hello', 'string': 2}, function(key, value) {
//   console.log(key, value);
// });
function each (obj, cb) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      cb(key, obj[key]);
    }
  }
}
exports.each = each;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// each_value({1: 'Hello', 'string': 2}, function(value) {
//   console.log(value);
// });
function each_value (obj, cb) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      cb(obj[key]);
    }
  }
}
exports.each_value = each_value;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// console.log(
//   compose(function() {
//     return 'Hello world'
//   }, function(data) {
//     return [2+2, data];
//   }, function(data) {
//     data.push(120);
//     return data;
//   })
// );
// Последовательный вызов функции
// с последующей передаче результатов в следующую функцию
function compose () {
  var list_func = arguments,
      finish    = list_func.length,
      i         = 1;
  var result = list_func[0]();
  while (i < finish) { result = list_func[i](result); i++; }
  return result;
}
exports.compose = compose;


// ПАТТЕРН ИСПОЛЬЗОВАНИЯ
// console.log(
//   compose_start_data(
//   ['Users: ', ['Vasya', 'Petya', 'Olya']],
//   function(params) {
//     var string = params[0];
//     var arr    = params[1];
//     return 'Hello world! '+string+arr.join(', ');
//   }, function(data) {
//     return [2+2, data];
//   }, function(data) {
//     data.push(120);
//     return data;
//   })
// );
// Последовательный вызов функции
// первым парметром идут данные (массив, объект)
// для первой функции, с последующей передаче результатов в следующую функцию
function compose_start_data () {
  var list_func = arguments,
      finish    = list_func.length,
      i         = 2;
  var start_data = list_func[0],
      result     = list_func[1](start_data);
  while (i < finish) { result = list_func[i](result); i++; }
  return result;
}
exports.compose_start_data = compose_start_data;