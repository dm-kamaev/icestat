/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// ОБЩИЕ ФУНКЦИИ ДЛЯ РАБОТЫ с highcharts

var work_highcharts = (function () {
  "use strict";
  var exports = {};

  // chart –– $('#id')
  exports.add_chart = function (chart, data) {
    chart = (typeof chart === 'string') ? $(chart).highcharts() : chart;
    chart.addSeries(data);
    chart.hideLoading();
    chart.redraw();
  };


  // chart –– $('#id')
  exports.remove_chart = function (chart, who) {
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
  exports.set_chart_option = function (name, data) {
    var chart_option = {
      // не обязательный параметр
      // id: 'series-' + mountItem.mount.replace('/', ''), // не обязательный параметр
      name : name,
      data : data, //[[200, 200], [300, 300]]
      color: getRandomColor()
    };
    return chart_option;
  };

  // TODO: вынести скорей всего в show_uniq.js
  // оси  и полотно для отрисовки вертикальных графиков
  // id –– '#id',
  // list_radio_name –– ["Дорожное 64 (без рекламы)", "BlackStarRadio"]
  // range_date      –– '2016-03-29 –– 2016-03-31'
  // arr_all         –– [50221, 237698 ... ] все пользователи для каждой станции (в порядке list_radio_name)
  // arr_uniq        –– [18457, 21782, ...]  все пользователи для каждой станции (в порядке list_radio_name)
  exports.render_axis_vertical_column_with_data = function (id, list_radio_name, range_date, arr_all, arr_uniq) {
    $(id).highcharts({
      chart: {
        type: 'column',
        margin: 150,
        options3d: {
          enabled: true,
          alpha: 10,
          beta: 25,
          depth: 70
        }
      },
      credits: {
        text: '',
      },
      title: {
        text: 'Unique listeners'
      },
      subtitle: {
        text: 'Date: '+range_date
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        column: {
          depth: 25
        }
      },
      xAxis: {
        categories: list_radio_name,
        labels: {
          rotation: -25,
        }
      },
      yAxis: {
        title: {
          text: null
        }
      },
      series: [{
        name: 'Unique',
        color: '#7cb5ec',
        data: arr_uniq
      }, {
        name: 'All',
        color: '#ff8dff',
        data: arr_all
      }]
    });
  };


  // ЭКСПОРТИРУЕМЫЕ МЕТОДЫ
  return exports;
}());


