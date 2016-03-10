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


// console.log(red('Hello world'));
function red (str) {
  return '\033[31m'+str+'\033[39m'; //текст будет красный
}
exports.red = red;


function dark_blue (str) {
  return '\033[34m'+str+'\033[39m'; //текст будет синий
}
exports.dark_blue = dark_blue;


function purple (str) {
  return '\033[35m'+str+'\033[39m'; //текст будет бордовый
}
exports.purple = purple;


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
}