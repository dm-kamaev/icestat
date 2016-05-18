/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// Listeners -> Unique
// Считаем всех слушателей за выбранный диапазон дат, а затем во всем диапозоне дат ищем
// уникальных слушателей

var show_uniq = (function () {
  "use strict";
  var TREE = {
    'main'                  : { id: 'main' },
    'datapicker'            : { id: 'main_1' },
    'get_data'              : { id: 'main_2', style: '"margin-top:50px;text-align:center"'},
    'charts'                : { id: 'main_3'},
    button_exportExcel_table: { id: 'main_4' },
  };

  var start = function() {
    getByID(TREE.main.id).innerHTML       = html_architecture();
    getByID(TREE.get_data.id).innerHTML   = html_button_get_data();
    getByID(TREE.datapicker.id).innerHTML = work_daterangepicker.get_html_daterange();
    getByID(TREE.get_data.id).onclick     = build_page_uniq;
    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    // initDatepicker(build_page_uniq); // вставляем в календарь вчерашний день и вешаем функцию на изменение даты
    // build_page_uniq();
  };

  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start : start };

  function build_page_uniq () {
    getByID(TREE.get_data.id).innerHTML = ''; // удаляем кнопку
    // вешаем функцию на изменение даты
    work_daterangepicker.changed_datepicker(build_page_uniq);
    var CONTEXT = add_methods_context({});

    var mountList = getSelectedMounts();
    var range     = getDateRange();
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат
    CONTEXT.set('mountList', mountList); // [ { mount_id: 20, mount: /blackstarradio128.mp3, name: BlackStarRadio, hostname: "blackstarradio.hostingradio.ru", station_url: http://blackstarradio.hostingradio.ru:8024/status_stream.xsl}]
    CONTEXT.set('start_date', range[0]);
    CONTEXT.set('end_date',   range[1]);
    CONTEXT.set('view_range_date', (range[0] === range[1]) ? range[0] : range[0]+' –– '+range[1]);
    CONTEXT.set('stationsRadio_radioName', get_stationsRadio_radioName(CONTEXT));
    getByID(TREE.charts.id).innerHTML                   = '<p style=margin-top:50px;text-align:center;color:#999>Processing...</p>';
    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=margin-top:150px;text-align:center;color:#999>Processing...</p>';
    request_about_uniq(CONTEXT);
  }


  function request_about_uniq (CONTEXT) {
    var radios = fn.map_value(CONTEXT.get('mountList'), function(radio) {
      return { db: 'stations_'+radio.hostname, mount: radio.mount, name: radio.name};
    });
    CONTEXT.set('radios', radios);

    _R('/listeners/api_uniq', {
        start_date: CONTEXT.get('start_date'),
        end_date  : CONTEXT.get('end_date'),
        radios    : JSON.stringify(radios)
      }, function(Xhr) {
      // { stations_dorognoe.hostingradio.ru_2016-03-30_2016-03-30: { all: 50221, uniq: 18457}, ... }
      var answer = JSON.parse(Xhr.responseText);
      CONTEXT.set('data', answer);
      work_highcharts.render_axis_vertical_column_with_data( // отрисовка графика вместе с полотном
        '#'+TREE.charts.id,
        fn.map_value(radios, function(radio) { return radio.name; }),
        CONTEXT.get('view_range_date'),
        chart_get_all_listeners(CONTEXT),
        chart_get_uniq_listeners(CONTEXT)
      );
      getByID(TREE.button_exportExcel_table.id).innerHTML = html_button_export_excel(CONTEXT) + html_table(CONTEXT);
    });
  }


  function html_architecture () {
    var html = '';
    html+='<div id='+TREE.main.id+'>';
      html+='<div id='+TREE.datapicker.id+'></div>'; // datapicker
      html+='<div id='+TREE.get_data.id+' style='+TREE.get_data.style+'></div>';// start button 'Get data'
      html+='<div id='+TREE.charts.id+'></div>';     // charts
      html+='<div id='+TREE.button_exportExcel_table.id+'></div>'; // button export excel, table
    html+='</div>';
    return html;
  }


  function html_button_export_excel (CONTEXT) {
    var html = '';
    var stations_name = fn.map_value(CONTEXT.get('stationsRadio_radioName'), function(radio) {
      return radio[1];
    }).join('__').replace(/\s+/g, '_').replace(/\"\'/g, '')+'_'+CONTEXT.get('view_range_date');
    var filename = 'unique_'+stations_name+'.xls';
    html += '<a style="margin:20px auto" class="btn btn-default buttons-excel buttons-html5" download='+filename+' href="#" onclick="return ExcellentExport.excel(this, \'table_data\', \''+stations_name+'\');">Export to Excel</a>';
    return html;
  }


  // data –– { 'stations_dorognoe.hostingradio.ru_2016-03-27_2016-03-27': { all: 33563, uniq: 11279 }, 'stations_blackstarradio.hostingradio.ru_2016-03-27_2016-03-27': { all: 259018, uniq: 19989 } }
  // stationsRadio_radioName –– [ ["stations_dorognoe.hostingradio.ru_/dorognoe128.mp3", "Дорожное 64 (без рекламы)"], [ "stations_blackstarradio.hostingradio.ru_/blackstarradio128.mp3": "BlackStarRadio"], ... ]
  // view_range_date –– '2016-03-29 –– 2016-03-31'
  function html_table (CONTEXT) {
    var html = '';
    var data                    = CONTEXT.get('data'),
        stationsRadio_radioName = CONTEXT.get('stationsRadio_radioName'),
        range_date              = CONTEXT.get('start_date')+'_'+CONTEXT.get('end_date'),
        view_range_date         = CONTEXT.get('view_range_date'),
        sum_all_listeners       = 0, // сумма всех слушателей для всех выбранных радио
        sum_uniq_listeners      = 0; // сумма всех уникальных слушателей для всех выбранных радио
    html += '<table id=table_data class="table table-striped table-bordered">';
      html += '<tr>';
        html += '<th>Date</th>';
        fn.foreach_value(stationsRadio_radioName, function(radio) {
        html += '<th>'+radio[1]+' Listeners</th>';
        html += '<th>'+radio[1]+' Unique</th>';
        });
        html += '<th>All Listeners</th>';
        html += '<th>All Unique</th>';
      html += '<tr>';
        html += '<td><span style="white-space:nowrap">'+view_range_date+'</span></td>';
        fn.foreach_value(stationsRadio_radioName, function(radio) {
        var key  = radio[0]+'_'+range_date,
            all  = data[key].all,
            uniq = data[key].uniq;
        sum_all_listeners  += all;
        sum_uniq_listeners += uniq;
        html += '<td>'+format.separate_discharges(all)+'</td>';
        html += '<td>'+format.separate_discharges(uniq)+'</td>';
        });
       html += '<td>'+format.separate_discharges(sum_all_listeners)+'</td>';
       html += '<td>'+format.separate_discharges(sum_uniq_listeners)+'</td>';
    html+= '</table>';
    return html;
  }


  function html_button_get_data () {
    var html = '';
    return '<button type=button style="width:25%;font-size:140%;" class="btn btn-success">Get data</button>';
  }

  // массив имен станций и наименований радио
  // return –– [ ["stations_dorognoe.hostingradio.ru_/dorognoe128.mp3", "Дорожное 64 (без рекламы)"], [ "stations_blackstarradio.hostingradio.ru_/blackstarradio128.mp3": "BlackStarRadio"], ... ]
  function get_stationsRadio_radioName (CONTEXT) {
    return fn.map_value(CONTEXT.get('mountList'), function(radio) {
      return ['stations_'+radio.hostname+'_'+radio.mount, radio.name];
    });
  }


  // stationsRadio_radioName –– [ ["stations_dorognoe.hostingradio.ru_/dorognoe128.mp3", "Дорожное 64 (без рекламы)"], [ "stations_blackstarradio.hostingradio.ru_/blackstarradio128.mp3": "BlackStarRadio"], ... ]
  // return –– [50221, 237698 ... ] все пользователи для каждой станции (в порядке stationsRadio_radioName)
  function chart_get_all_listeners (CONTEXT) {
    var data       = CONTEXT.get('data'),
        range_date = CONTEXT.get('start_date')+'_'+CONTEXT.get('end_date');
    return fn.map_value(CONTEXT.get('stationsRadio_radioName'), function(radio) {
      return data[radio[0]+'_'+range_date].all;
    });
  }


  // stationsRadio_radioName –– [ ["stations_dorognoe.hostingradio.ru_/dorognoe128.mp3", "Дорожное 64 (без рекламы)"], [ "stations_blackstarradio.hostingradio.ru_/blackstarradio128.mp3": "BlackStarRadio"], ... ]
  // return –– [18457, 21782, ...] все уникальные пользователи для каждой станции (в порядке stationsRadio_radioName)
  function chart_get_uniq_listeners (CONTEXT) {
    var data       = CONTEXT.get('data'),
        range_date = CONTEXT.get('start_date')+'_'+CONTEXT.get('end_date');
    return fn.map_value(CONTEXT.get('stationsRadio_radioName'), function(radio) {
      return data[radio[0]+'_'+range_date].uniq;
    });
  }


}());