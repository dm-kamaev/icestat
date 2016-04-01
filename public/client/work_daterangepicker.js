/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// МЕТОДЫ РАБОТЫ С БИБЛИОТЕКОЙ daterangepicker.js

var work_daterangepicker = (function () {
  "use strict";
  var exports = {};

  // календарь с заданием диапазона дат
  exports.get_html_daterange = function() {
    var html = '';
    html += '<div class="input-group input-daterange">';
      html += '<input id="fromDate" type="text" class="form-control"/>';
      html += '<span class="input-group-addon">to</span>';
      html += '<input id="toDate" type="text" class="form-control"/>';
    html += '</div>';
    return html;
  };

  // календарь с заданием конкретной даты
  exports.get_html_datepicker = function () {
    var html = '';
    html += '<div class="input-group date" data-provide="datepicker" id="dpSingle">';
      html += '<input type="text" class="form-control">';
      html += '<div class="input-group-addon">';
        html += '<span class="glyphicon glyphicon-th"></span>';
      html += '</div>';
    html += '</div>';
    return html;
  };

  /* экспортируем функции */
  return exports;
}());


