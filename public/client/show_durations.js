/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// Other -> Duration
// КОЛИЧЕСТВО СЛУШАТЕЛЕЙ В ДИАПАЗОНАХ ВРЕМЕНИ.
// СКОЛЬКО СЛУШАТЕЛЕЙ ПРОСЛУШИВАЛО СТАНЦИЮ В ВРЕМЕННЫХ ИНТЕРВАЛАХ.

var show_durations = (function () {
  "use strict";

  var TREE = {
    'main'                  : { id: 'main' },
    'datarange'             : { id: 'main_1' },
    'get_data'              : { id: 'main_2', style: 'style=margin-top:50px;text-align:center'},
    charts                  : { id: 'chart_other_durations'},
    button_exportExcel_table: { id: 'main_3' },
  };

  var start = function () {
    getByID(TREE.main.id).innerHTML      = html_containers();
    getByID(TREE.datarange.id).innerHTML = work_daterangepicker.get_html_daterange();
    getByID(TREE.get_data.id).innerHTML  = html_button_get_data();
    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    getByID(TREE.get_data.id).onclick = sendOtherDurationsRequest;
  };
  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start : start };

  function sendOtherDurationsRequest() {
    getByID(TREE.get_data.id).innerHTML = ''; // убираем кнопку
    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=text-align:center;color:#999>Processing...</p>';
    // вешаем функцию на изменение даты
    work_daterangepicker.changed_datepicker(sendOtherDurationsRequest);
    setHighchartUseUTC(true);

    var CONTEXT = add_methods_context({});

    var mountList = getSelectedMounts(), range = getDateRange();
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат

    CONTEXT.set('mountList', mountList);
    CONTEXT.set('range_date', range);
    CONTEXT.set('list_radio_name', get_list_radio_name(getSelectedMounts()));
    CONTEXT.set('station_name',    CONTEXT.get('list_radio_name').join('__'));

    render_durations_charts(CONTEXT);

    // TODO: При быстром смене даты происходит то, что бибилиотека highcharts начинает
    // несколько раз отрисовывать и в результате
    // Uncaught TypeError: Cannot read property 'chart' of undefined
    // Надо сделать защиту от этого...
    var chart = $('#'+TREE.charts.id).highcharts();
    chart.showLoading();
    $.post('/api/other/durations', {
        startDate: range[0],
        endDate: range[1],
        mounts: JSON.stringify(mountList)
      },
      function(result, textStatus, jqXHR) {
        // console.log(result);
        CONTEXT.set('durations', result);
        var total = result.total;
        var for_charts = [];
        for_charts.push(total.d_5min);
        for_charts.push(total.d_5_10min);
        for_charts.push(total.d_10_30min);
        for_charts.push(total.d_30m_1h);
        for_charts.push(total.d_1_2h);
        for_charts.push(total.d_2_5h);
        for_charts.push(total.d_more_5h);
        // console.log('chart before render', chart, for_charts)

        chart.addSeries({
          name: 'Durations',
          data: for_charts
        });

        chart.redraw();
        chart.hideLoading();
        getByID(TREE.button_exportExcel_table.id).innerHTML =
          html_button_export_excel(CONTEXT) + html_table(CONTEXT);
      }
    );
  }


  function render_durations_charts(CONTEXT) {
    var categories = [
      "Less than 5 minutes",
      "From 5 to 10 minutes",
      "From 10 to 30 minutes",
      "From 30 minutes to 1 hour",
      "From 1 hour to 2 hours",
      "From 2 to 5 hours",
      "More than 5 hours"
    ];

    $('#chart_other_durations').highcharts({
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
      title: {
        text: 'Durations: '+CONTEXT.get('range_date').join(' –– '),
        style: { fontSize:'120%' },
      },
      credits: {
        text: '',
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
        categories: categories,
        labels: {
          rotation: -45,
        }
      },
      yAxis: {
        title: {
          text: null
        }
      }
    });
  }

  // ['BlackStarRadio', 'Дорожное64 (без рекламы)']
  function get_list_radio_name (mountList) { return fn.map_value(mountList, function(station) { return station.name; }); }


  function html_containers () {
    var html = '';
    html+='<div id='+TREE.main.id+'>';
      html+='<div id='+TREE.datarange.id+'></div>'; // datapicker
      html+='<div id='+TREE.get_data.id+' '+TREE.get_data.style+'></div>'; // button get data
      html+='<div id='+TREE.charts.id+'></div>'; // charts
      html+='<div id='+TREE.button_exportExcel_table.id+'></div>'; // button export excel, table
    html+='</div>';
    return html;
  }


  function html_button_get_data () { return '<button type=button style=width:25%;font-size:140%; class="btn btn-success">Get data</button>'; }


  function html_button_export_excel (CONTEXT) {
    var html = '';
    var station_name = CONTEXT.get('station_name').replace(/\s+/g, '_').replace(/\"\'/g, '');
    var range_date   = CONTEXT.get('range_date'), view_date = range_date[0]+'_'+range_date[1];
    var filename = 'durations_'+station_name+'_'+view_date+'.xls';
    html += '<a style="margin:20px auto" class="btn btn-default buttons-excel buttons-html5" download='+filename+' href="#" onclick="return ExcellentExport.excel(this, \'table_data\', \''+station_name+'\');">Export to Excel</a>';
    return html;
  }


  function html_table (CONTEXT) {
    var html = '';
    var css  = '';
    var durations = CONTEXT.get('durations'), list_radio_name = CONTEXT.get('list_radio_name');
    var order_durations = ['d_5min', 'd_5_10min', 'd_10_30min', 'd_30m_1h', 'd_1_2h', 'd_2_5h', 'd_more_5h'];
    html += '<table id=table_data class="table table-striped table-bordered">';
      html += '<tr>';
        html += '<th>Duration</th>';
        fn.foreach_value(list_radio_name, function(radio_name) {
          html += '<th>'+radio_name+'</th>';
        });
      html += '<th>Total</th>';
      var columns_name = list_radio_name;
      columns_name.push('total');
      fn.foreach_value(order_durations, function(category) {
      html += '<tr>';
        html += '<td>'+get_description_categories(category)+'</td>';
        fn.foreach_value(columns_name, function(radio_name) {
        html += '<td>'+format.separate_discharges(durations[radio_name][category])+'</td>';
        });
      });
    html += '</table>';
    return html;
  }

  function get_description_categories (type) {
    var categories = {
      d_5min    : 'Less than 5 minutes',
      d_5_10min : 'From 5 to 10 minutes',
      d_10_30min: 'From 10 to 30 minutes',
      d_30m_1h  : 'From 30 minutes to 1 hour',
      d_1_2h    : 'From 1 hour to 2 hours',
      d_2_5h    : 'From 2 to 5 hours',
      d_more_5h : 'More than 5 hours',
    };
    return categories[type] || 'Нет описания';
  }

}());