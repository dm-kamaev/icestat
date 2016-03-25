/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */


// ФУНКЦИОНАЛЬНЫЕ МЕТОДЫ

var fn = (function () {
  "use strict";
  // var ar = [1,2,3, '', null, undefined];
  // foreach(ar, function(el) {
  //   console.log(el+1);
  // });
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var foreach = function (array, cb) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {cb(i, el);}
    }
  };


  // var ar = [1,2,3, '', null, undefined];
  // foreach(ar, function(el) {
  //   console.log(el+1);
  // });
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var foreach_value = function (array, cb) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {cb(el);}
    }
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var new_ar = map([1,2,3], function(el) {
  //   return el*el;
  // });
  // console.log(new_ar);
  // ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var map = function (array, cb) {
    var res = [];
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        var new_el = cb(i, el);
        if (new_el !== undefined) {res.push(new_el);}
      }
    }
    return res;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var new_ar = map([1,2,3], function(el) {
  //   return el*el;
  // });
  // console.log(new_ar);
  // ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var map_value = function (array, cb) {
    var res = [];
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        var new_el = cb(el);
        if (new_el !== undefined) {res.push(new_el);}
      }
    }
    return res;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var new_ar = map_object({'Hello' : 'world', test:'123'}, function(el) {
  //   return el*el;
  // });
  // console.log(new_ar);
  // ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
  var map_object = function (obj, cb) {
    var res = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var new_el = cb(key, obj[key]);
        if (new_el !== undefined) {res.push(new_el);}
      }
    }
    return res;
  };


  // var ar = [1, 2, 3];
  // var sum = reduce(ar, function(res, i, el) {
  //   return res + el;
  // }, '');
  // console.log(sum);
  // ВНИМАНИЕ С ТИПА ДАННЫХ: ТУТ ЛИБО ВСЕ СТРОКИ НА ВЫХОД, ЛИБО ЧИСЛА
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  // res –– стартовая сумма, если это число, то все будет обрабатываться как числа, если строка,
  // то как строки
  var reduce = function (array, cb, res) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {res = cb(res, i, el);}
    }
    return res;
  };


  // var ar = [1, 2, 3];
  // var sum = reduce_value(ar, function(res, el) {
  //   return res + el;
  // }, '');
  // console.log(sum);
  // ВНИМАНИЕ С ТИПА ДАННЫХ: ТУТ ЛИБО ВСЕ СТРОКИ НА ВЫХОД, ЛИБО ЧИСЛА
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  // res –– стартовая сумма, если это число, то все будет обрабатываться как числа, если строка,
  // то как строки
  var reduce_value = function (array, cb, res) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {res = cb(res, el);}
    }
    return res;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var new_ar = filter([1,2,3], function(el) {
  //   return el < 3;
  // });
  // console.log(new_ar);
  // ИСПОЛЬЗОВАТЬ ТОЛЬКО ТОГДА, КОГДА НУЖНО ВЕРНУТЬ НОВЫЙ МАССИВ
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var filter = function (array, cb) {
    var res = [];
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        if (cb(el) === true) {res.push(el);}
      }
    }
    return res;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var new_ar = every([5, 5, 6, 5], function(el) {
  //   return el === 5;
  // });
  // console.log(new_ar);
  // ВЕРНЕТ TRUE, ЕСЛИ ВСЕ ЭЛЕМЕНТЫ МАССИВА УДОВЛЕТВОРЯЮТ УСЛОВИЮ
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var every = function (array, cb) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        if (cb(el) !== true) {return false;}
      }
    }
    return true;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var new_ar = some([7, 7, 6, 5], function(el) {
  //   return el === 6;
  // });
  // console.log(new_ar);
  // ВЕРНЕТ TRUE, ЕСЛИ ХОТЯ БЫ ОДИН ЭЛЕМЕНТ МАССИВА УДОВЛЕТВОРЯЕТ УСЛОВИЮ
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var some = function (array, cb) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        if (cb(el) === true) {return true;}
      }
    }
    return false;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var res = search_in_obj({'Hello': 'world', 'Vasya': 'Petya'}, function(key, value) {
  //   return (key === 'Hello') ? value : false;
  // });
  // console.log(res);
  // ИЩЕТ В ОБЪЕКТЕ ЭЛЕМЕНТ УДОВЛЕТВОРЯЮЩИЙ УСЛОВИЮ И СРАЗУ ВОЗВРАЩАЕТ ЕГО
  var search_in_obj = function (obj, cb) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var res = cb(key, obj[key]);
        if (res) { return res; }
      }
    }
    return null;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // var res = search_in_obj(['Hello', 'world', 'Vasya', 'Petya'], function(i, el) {
  //   return (el === 'Vasya') ? i : false;
  // });
  // console.log(res);
  // ИЩЕТ В МАССИВЕ ЭЛЕМЕНТ УДОВЛЕТВОРЯЮЩИЙ УСЛОВИЮ И СРАЗУ ВОЗВРАЩАЕТ ЕГО
  // ДЛЯ ПУСТОЙ СТРОКИ, NULL, UNDEFINED НЕ СРАБОТАЕТ CALLBACK!!!!
  var search_in_array = function (array, cb) {
    for (var i = 0, l = array.length; i < l; i++) {
      var el = array[i];
      if (el || el === 0) {
        var res = cb(i, el);
        if (res) { return res; }
      }
    }
    return null;
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // each({1: 'Hello', 'string': 2}, function(key, value) {
  //   console.log(key, value);
  // });
  var each = function (obj, cb) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cb(key, obj[key]);
      }
    }
  };


  // ПАТТЕРН ИСПОЛЬЗОВАНИЯ
  // each_value({1: 'Hello', 'string': 2}, function(value) {
  //   console.log(value);
  // });
  var each_value = function (obj, cb) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cb(obj[key]);
      }
    }
  };

  return {
    'foreach'        : foreach,
    'foreach_value'  : foreach_value,
    'each'           : each,
    'each_value'     : each_value,
    'map'            : map,
    'map_value'      : map_value,
    'map_object'     : map_object,
    'reduce'         : reduce,
    'reduce_value'   : reduce_value,
    'filter'         : filter,
    'every'          : every,
    'some'           : some,
    'search_in_array': search_in_array,
    'search_in_obj'  : search_in_obj,
  };
}());
