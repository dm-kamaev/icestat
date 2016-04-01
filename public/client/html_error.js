/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// ВЫВОД ОШИБОК ДЛЯ ПОЛЬЗОВАТЕЛЯ

var html_error = (function () {
  "use strict";
  var exports = {};

  // если нет данных от СЕРВЕРА рисуем сообщение
  exports.not_exist_data_on_date = function () {
    var html = '',
        text = 'Sorry, the data for a selected period of time absent. Try to select another date.';
    html += '<span style="font-size:200%;color:#EC4B4B">'+text+'<span>';
    return html;
  };

  exports.view = function (id, data) {
    getByID(id).innerHTML = data;
  };

  /* экспортируем методы */
  return exports;
}());


