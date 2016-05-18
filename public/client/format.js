/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// МЕТОДЫ ФОРМАТИРОВАНИЯ ДАННЫХ

var format = (function () {
  "use strict";
  var exports = {};

  // отделяем разряды чисел было 10200 стало 10 200
  exports.separate_discharges = function (str) {  return str.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 '); }

  return exports;
}());


