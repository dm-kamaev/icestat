/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// МЕТОДЫ ДЛЯ ПОМЕЩЕНИЯ ДАННЫХ В COOKIE

var work_cookie = (function () {
  "use strict";
  var exports = {};

  // ['2016-03-27', '2016-04-27] даты для календаря
  exports.set_range = function (range) {
    setCookie('start_date', range[0], 1, '/', window.location.hostname);
    setCookie('end_date',   range[1], 1, '/', window.location.hostname);
  }

  /* экспортируем методы */
  return exports;
}());


