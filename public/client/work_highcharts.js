/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// ОБЩИЕ ФУНКЦИИ ДЛЯ РАБОТЫ с highcharts

var work_highcharts = (function () {
  "use strict";
  var METHODS = {};

  // chart –– $('#id')
  METHODS.add_chart = function (chart, data) {
    chart = (typeof chart === 'string') ? $(chart).highcharts() : chart;
    chart.addSeries(data);
    chart.hideLoading();
    chart.redraw();
  };


  // chart –– $('#id')
  METHODS.remove_chart = function (chart, who) {
    chart = (typeof chart === 'string') ? $(chart).highcharts() : chart;
    for (var i = 0, l = chart.series.length; i < l; i++) {
      if (chart.series[i] && chart.series[i].name && chart.series[i].name === who) {
        chart.series[i].remove();
        chart.redraw();
      }
    }
  };

  // name –– имя графика (по этому имени можно удалить график)
  // data –– данные в виде [[x, y],[x, y], ...]
  METHODS.set_chart_option = function (name, data) {
    var chart_option = {
      // не обязательный параметр
      // id: 'series-' + mountItem.mount.replace('/', ''), // не обязательный параметр
      name : name,
      data : data, //[[200, 200], [300, 300]]
      color: getRandomColor()
    };
    return chart_option;
  }

  // ЭКСПОРТИРУЕМЫЕ МЕТОДЫ
  return METHODS;
}());


