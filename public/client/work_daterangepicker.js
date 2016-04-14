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

  // календарь с выбором диапазона дат
  exports.get_html_daterange = function() {
    var html = '';
    html += '<div class="input-group input-daterange">';
      html += '<input id="fromDate" type="text" class="form-control"/>';
      html += '<span class="input-group-addon">to</span>';
      html += '<input id="toDate" type="text" class="form-control"/>';
    html += '</div>';
    return html;
  };

  // календарь с выбором конкретной даты
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


  // иницилизируем календарь (диапазон) с позапрошлым днем  –– вчерашним днем
  // или если передали диапазон, то выставляем его
  // start_date, end_date –– '2016-03-27'
  exports.init_datepicker = function(start_date, end_date) {
    var days = 1; // предыдущий день
    var picker = $(".input-daterange").datepicker({
      format: 'yyyy-mm-dd',
      autoclose: true,
      todayHighlight: true,
      weekStart: 1, // неделя начинается Monday
      endDate: '-1d', // заблокировать выбор текущего дня и времени в будущем
    });
    var start_from_day = (start_date) ? start_date : moment().subtract(days, 'days').format('YYYY-MM-DD');
    var end_from_day   = (end_date)   ? end_date   : moment().subtract(1, 'days').format('YYYY-MM-DD');
    $('#fromDate').datepicker('update', start_from_day),
    $('#toDate').datepicker('update', end_from_day);
  };


  // bootstrap datepicker
  // Вешаем на календарь(диапазон) обработчик, если user изменил одну из дат
  // заново вызываем функцию
  exports.changed_datepicker = function(callback) {
    $(".input-daterange").on('changeDate', function(e) { callback(); });
  };

  /* экспортируем функции */
  return exports;
}());


