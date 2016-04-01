#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

// ИСПОЛЬЗОВАНИЕ ДАННОЙ ПРАГМЫ БУДЕТ ВЫЗЫВАТЬ ОШИБКУ
// "use strict";


// РАCКРАШИВАЕМ СТРОКУ В ЦВЕТА, РАБОТАЕТ ДЛЯ КОНСОЛИ BASH

var util = require('util');

function print_text_color () {
  // "use strict;" не работает
  console.log('\033[30m текст');  //текст будет черный
  console.log('\033[31m текст');  //текст будет красный
  console.log('\033[91m текст');  //текст будет красный другого оттенка
  console.log('\033[32m текст');  //текст будет зеленый
  console.log('\033[33m текст');  //текст будет желтый
  console.log('\033[34m текст');  //текст будет синий
  console.log('\033[35m текст');  //текст будет бордовый
  console.log('\033[36m текст');  //текст будет голубой
  console.log('\033[37m текст');  //текст будет белый
  console.log('\033[39m текст');  //вернет значение цвета по умолчанию.
  console.log('\033[1mТекст\033[0mText'); // текст будет жирным
  console.log('\033[4mТекст\033[0mText'); // текст будет подчеркнутым
  console.log('\033[5mТекст\033[0mText'); // текст будет мигающим
}

// console.log(red('Hello world'));
exports.set_red = function () {
  var res = prepare_params(arguments);
  return '\033[31m'+res.join(' ')+'\033[39m'; // возвращает красный текст
};
// console.log(exports.set_red('ERROR:', {'hello': 'world'}));


exports.set_bred = function () {
  var res = prepare_params(arguments);
  return '\033[1m\033[31m'+res.join(' ')+'\033[39m\033[0m'; // возвращает жирный красный текст
};
// console.log(exports.set_bred('ERROR:', {'hello': 'world'}));


exports.set_green = function () {
  var res = prepare_params(arguments);
  return '\033[32m'+res.join(' ')+'\033[39m'; // возвращает зеленый цвет
};
// console.log(exports.set_green(1, 2, {'hello': 'world'}, [1,2,3, {key:'value1'}]));
// console.log(exports.set_green('ERROR:', {'hello': 'world'}));



exports.set_bgreen = function () {
  var res = prepare_params(arguments);
  return '\033[1m\033[32m'+res.join(' ')+'\033[39m\033[0m'; // возвращает жирный зеленый цвет
};
// console.log(exports.set_bgreen(1, 2, {'hello': 'world'}, [1,2,3, {key:'value1'}]));
// console.log(exports.set_bgreen('ERROR:', {'hello': 'world'}));


exports.set_blue = function() {
  return '\033[36m'+prepare_params(arguments).join(' ')+'\033[39m';
};


exports.set_bblue = function() {
  return '\033[1m\033[36m'+prepare_params(arguments).join(' ')+'\033[39m\033[0m';
};


// –––––––––––––––––––––––––––––– печать на экран ––––––––––––––––––––––––––

exports.out_red = function () {
  var res = prepare_params(arguments);
  console.log('\033[31m'+res.join(' ')+'\033[39m'); //текст будет красный
};
// exports.out_red(1, 2, {'hello': 'world'}, [1,2,3, {key:'value1'}]);
// exports.out_red('ERROR:', {'hello': 'world'});


// жирный красный цвет
exports.out_bred = function () {
  var res = prepare_params(arguments);
  console.log('\033[1m\033[31m'+res.join(' ')+'\033[39m\033[0m');
};
// exports.out_bred(1, 2, {'hello': 'world'}, [1,2,3, {key:'value1'}]);
// exports.out_bred('ERROR:', {'hello': 'world'});


exports.out_green = function () {
  var res = prepare_params(arguments);
  console.log('\033[32m'+res.join(' ')+'\033[39m');
};
// exports.out_green(1, 2, {'hello': 'world'}, [1,2,3, {key:'value1'}]);
// exports.out_green('ERROR:', {'hello': 'world'});


// жирный зеленый цвет
exports.out_bgreen = function () {
  var res = prepare_params(arguments);
  console.log('\033[1m\033[32m'+res.join(' ')+'\033[39m\033[0m');
};
// exports.out_bgreen(1, 2, {'hello': 'world'}, [1,2,3, {key:'value1'}]);
// exports.out_bgreen('ERROR:', {'hello': 'world'});


// из псевдо массива arguments делаем массив парметров цвета функции
function prepare_params (arg) {
  var res = [];
  for (var i = 0, l = arg.length; i < l; i++) {
    var el = arg[i];
    if (el instanceof Object) {
      res.push(util.inspect(el));
    } else {
      res.push(el);
    }
  }
  return res;
}