/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// ВКЛАДКА LISTENERS –> NEW PEAK

// УДОБНО ДЛЯ ЛОГИРОВАНИЯ
// var CONTEXT = add_methods_context({});

var show_peak_listeners_page = (function () {
  "use strict";

  var start = function () {
    stopAnyIntervals();
    // Вставка поля выбора дат и каркас для графиков и таблицы
    $.get("/listeners/peak",  function(data, status){
      $(".container").html(data);
      initDatepicker(build_page_peak_listeners); // вешаем обработчик для календаря
      build_page_peak_listeners();
    });
  };
  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start : start };


// ---------------------------------------------------------------------------------------
  function build_page_peak_listeners() {
    var CONTEXT = add_methods_context({});
    // заново иницилизуруем таблицу и checkbox
    clean_checkboxTable();
    // рисуем оси
    draw_axis_charts();

    var range     = getDateRange(),
        mountList = getSelectedMounts();
    CONTEXT.set('mountList', mountList);

    var chart = $('#chart_peak_listeners').highcharts();
    chart.showLoading();

    // $.post('/api/listeners/peak', {
    //   startDate: '2016-02-16',
    //   endDate: '2016-02-16',
    //   mountItem: JSON.stringify({
    //     "mount_id": "2",
    //     "mount": "/dor_64_no",
    //     "name": "Дорожное 64 (без рекламы)",
    //     "hostname": "dorognoe.hostingradio.ru",
    //     "station_url": "http://dorognoe.hostingradio.ru:8000/status_stream.xsl"
    //   }),
    //   daysAgo : 7,
    // }, function(result, textStatus, jqXHR) {
    //   log(jqXHR.responseText);
    // });

    $.post('/api/listeners/peak_all', {
      startDate : range[0],
      endDate   : range[1],
      radios    : JSON.stringify(for_request(mountList)), // [ {db: "dorognoe.hostingradio.ru", mount: "/dor_64_no" }, {}, {}, ... ]
      // daysAgo   : CONST_LISTENERS_PEAK_DAYS_AGO() // было 7 дней, необязательный параметр
    }, function (result, textStatus, jqXHR) {
      var answer = JSON.parse(jqXHR.responseText);
      if (isEmptyHash(answer)) { html_warning(); return; }
      proccesing_answer(CONTEXT, answer);

      render_charts(CONTEXT, chart);

      // строим хэш все колонок и графиков вкл/выкл [0 или 1]
      CONTEXT.set('list_chartsColumns', get_hash_list_column(CONTEXT));

      // строим график total
      work_highcharts.add_chart(chart,
        html_chart_total(
          data_chart_total(
            CONTEXT,
            get_array_on_columnCharts(CONTEXT.get('list_chartsColumns'))
          )
        )
      );

      render_table(
        prepare_columns_for_table(CONTEXT, CONTEXT.get('list_chartsColumns')),
        prepare_data_for_table(CONTEXT, CONTEXT.get('list_chartsColumns'))
      );

      html_checkboxs(data_checkboxs(CONTEXT));
      set_events_data_managment(CONTEXT);
    });
  }
// ---------------------------------------------------------------------------------------

  // data –– [{ hostname: "dorognoe.hostingradio.ru", mount: "/dor_64_no", mount_id: "2", name: "Дорожное 64 (без рекламы)", station_url: "http://dorognoe.hostingradio.ru:8000/status_stream.xsl" }, {}, ...]
  // return [ {db: "dorognoe.hostingradio.ru", mount: "/dor_64_no" }, {}, {}, ... ]
  function for_request (data) {
    return fn.map_value(data, function(station) {
      return { db: 'stations_'+station.hostname, mount: station.mount};
    });
  }

  // строим хэш все колонок и графиков
  // return {Date: 1, Percent: 1, 7 days ago: 1, Дорожное 64 (без рекламы): 1, BlackStarRadio: 1}
  function get_hash_list_column (CONTEXT) {
    var res = {
      'Date'      : 1,
      'Total'     : 1,
      'Percent'   : 1,
      '7 days ago': 1,
    };
    // [ {mount_id: "2", mount: "/dor_64_no", name: "Дорожное 64 (без рекламы)", hostname: "dorognoe.hostingradio.ru", station_url: "http://dorognoe.hostingradio.ru:8000/status_stream.xsl"}, ... ]
    fn.foreach_value(CONTEXT.get('mountList'), function(radio) {
      res[radio.name] = 1;
    });
    return res;
  }


  // hash_on_columnCharts –– {Date: 1, Total: 1, Percent: 1, 7 days ago: 1, Дорожное 64 (без рекламы): 1…}
  // собираем в массив все имена колонок и графиков, которые включены
  // return ["Date", "Total", "Percent", "7 days ago", "Дорожное 64 (без рекламы)", "BlackStarRadio"]
  function get_array_on_columnCharts (hash_onOff_columsCharts) {
    return fn.map_object(hash_onOff_columsCharts, function(columnChart_name, onOff) {
      if (onOff === 1) { return columnChart_name; }
    });
  }


  // вычисляем Total для графика
  // Highcharts_data       –– {Дорожное 64 (без рекламы)::::/dor_64_no: [[ms, value], [12334340300, 408], ... ], BlackStarRadio::::/blackstarradio128.mp3: [[ms, value], [12334340300, 408], ... ], ...}
  // array_on_columnCharts –– ["Date", "Total", "Percent", "7 days ago", "Дорожное 64 (без рекламы)", "BlackStarRadio"]
  // return двумерный массив [[x, y], [x, y], ...]
  // x - время, y - пользователи
  function data_chart_total (CONTEXT, array_on_columnCharts) {
    var res    = [];
    var Highcharts_data = CONTEXT.get('Highcharts_data');
    var mount  = CONTEXT.get('mountList')[0].name;  // защитить от ошибок
    var stream = CONTEXT.get('mountList')[0].mount;

    var Total_length = CONTEXT.get('Highcharts_data')[mount+'::::'+stream].length || 0;

    var init_res = function (length) {for (var i = 0; i < length; i++) { res[i] = [0, 0]; }};
    init_res(Total_length);

    fn.foreach_value(array_on_columnCharts, function(columnChart_name) {
      fn.each(Highcharts_data, function(mount, coordinates) {
        var mount_name = mount.split('::::')[0];
        if (columnChart_name === mount_name) {
          for (var i = 0; i < Total_length; i++) { // TODO: Заменить Total_length на Total_length-1
            if (res[i][0] === 0) {res[i][0] += coordinates[i][0];}
            res[i][1] += coordinates[i][1];
          }
        }
      });
    });
    // log('result = ', res);
    return res;
  }


  // рисуем оси и подсказки
  function draw_axis_charts () {
    // if useUTC: true, то Highcharts.dateFormat добавляет/отнимает сам сдвиг по времени,
    // к тому времени что пришло с сервера
    Highcharts.setOptions({global: {useUTC: false}});
    // Если этого не делать, то надо руками на сервер добавлять
    // (например, для МSK это будет - 3 часа)
    // var date = new Date((start_day_sec + i * step_sec) * 1000).getTime();

    $('#chart_peak_listeners').highcharts({
      title: {
        text: 'Number of the peak time listeners',
      },
      credits: {
        text: '',
      },
      // всплывающая подсказка при наведении на график
      tooltip: {
        useHTML: true,
        formatter: function() {
          var result = '';
          result += '<text x="8" zIndex="1" style="font-family:arial;" transform="translate(0,20)">';
            result += '<tspan style="font-size:10px;">'+Highcharts.dateFormat('%A, %b %e, %Y, %H:%M', this.x)+'</tspan>';
            result += '</br><tspan style="color:#7CB5EC" x="8" dy="15">●</tspan>';
            result += '<tspan dx="0"> Listeners:  </tspan>';
            result += '<tspan style="font-weight:bold" dx="0">'+Highcharts.numberFormat(this.y, 0)+'</tspan>';
          result += '</text>';
          return result;
        },
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        allowDecimals: false,
              title: {
                  text: ''
              }
          },
      plotOptions: {
        series: {
          pointInterval: 60 * 15 * 1000
        }
      }
    });
  }


  // построение структур из данных приехавших с сервера
  // Data –– { '/blackstarradio128.mp3_main_Highcharts':  [ [ 1454187600000, 182 ], [ 1454188500000, 176 ], ...], ... }
  // TODO: на будущее делать return объектов и снаружи set in CONTEXT, а не внутри функции
  function proccesing_answer (CONTEXT, Data) {
    CONTEXT['Highcharts_data']      = {};
    CONTEXT['Table_data']           = {};
    CONTEXT['Table_data_7days_ago'] = {};
    var mountList = CONTEXT.get('mountList');
    fn.foreach_value(mountList, function(radio) {
      var mount_name   = radio.name,
          mount_stream = radio.mount;

      var Highcharts_data = Data[mount_stream+'_main_Highcharts'];
      if (Highcharts_data) { CONTEXT['Highcharts_data'][mount_name+'::::'+mount_stream] = Highcharts_data; }
      var Table_data = Data[mount_stream+'_main_Table'];
      if (Table_data) { CONTEXT['Table_data'][mount_name+'::::'+mount_stream] = Table_data; }

      // '/blackstarradio128.mp3_7days_ago_Table'
      var Table_data_7days_ago = Data[mount_stream+'_7days_ago_Table'];
      if (Table_data_7days_ago) { CONTEXT['Table_data_7days_ago'][mount_name+'::::'+mount_stream] = Table_data_7days_ago; }
    });
    // console.log('Highcharts ', CONTEXT['Highcharts_data']);
    // console.log('Table      ', CONTEXT['Table_data']);
    // console.log('Table      ', CONTEXT['Table_data_7days_ago']);
  }


  // добавляем в highcharts
  // chart –– $('#id')
  function render_charts (CONTEXT, chart) {
    // { 'Дорожное 64 (без рекламы)::::/dor_64_no' : [ [1454187600000, 182 ], [ 1454188500000, 176 ], ...], ... }
    fn.each(CONTEXT['Highcharts_data'], function(mount, data) {
        var mount_name = mount.split('::::')[0];
        var chart_data = {
            // id:    'series-' + mountItem.mount.replace('/',''),
            name:  mount_name,
            data:  data,
            color: getRandomColor()
        };
        chart.addSeries(chart_data);
        chart.hideLoading();
        chart.redraw();
      });
  }




  // отрисовка графика total и возврат данных для highcharts()
  // data –– [[x, y], [x, y], ...]
  // x –– ms, y –– value
  function html_chart_total (data) {
    var chart = $('#chart_peak_listeners').highcharts();
    var chart_total = {
      // id: 'series-' + mountItem.mount.replace('/', ''), // не обязательный параметр
      name: 'Total',
      data: data, //[[200, 200], [300, 300]]
      color: getRandomColor()
    };
    return chart_total;
  }


  // имена радио для checkbox
  // return ["Дорожное 64 (без рекламы)", "BlackStarRadio"]
  function data_checkboxs (CONTEXT) {
    var res       = [];
    fn.each_value(CONTEXT.get('mountList'), function(mountItem) {
      res.push(mountItem.name);
    });
    res.push('Total');
    return res;
  }


  // view for checkbox
  function html_checkboxs (data) {
    var html = '';
    html += '<div style=text-align:center>';
      fn.foreach(data, function(i, el) {
        html += '<label class=checkbox-inline>';
          html +='<input id=data_managment_'+(i+1)+' type=checkbox value="'+el+'" checked>'+el;
        html +='</label>';
      });
    html += '</div>';
    getByID('data_managment').innerHTML = html;
  }


  function set_events_data_managment (CONTEXT) {
    getByID('data_managment').onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        m = t.id.match(/^(data_managment_\d+)$/);
        if (m && m[1]) {
          var full_id = m[1];
          handler_checkbox(full_id);
        }
      }
    };

    var handler_checkbox = function (full_id) {
      var input        = getByID(full_id) || null,
          list_columns = CONTEXT.get('list_chartsColumns'),
          mount_name   = input.value;
      if (input.checked === true) {
        list_columns[mount_name] = 1;
        turn_on_chart(CONTEXT, mount_name);
        render_table(
          prepare_columns_for_table(CONTEXT, CONTEXT.get('list_chartsColumns')),
          prepare_data_for_table(CONTEXT, CONTEXT.get('list_chartsColumns'))
        );
      } else if (input.checked === false) {
        list_columns[mount_name] = 0;
        turn_off_chart(CONTEXT, mount_name);
        render_table(
          prepare_columns_for_table(CONTEXT, CONTEXT.get('list_chartsColumns')),
          prepare_data_for_table(CONTEXT, CONTEXT.get('list_chartsColumns'))
        );
      }
    };


  }


  function turn_on_chart (CONTEXT, mount_name) {
    var chart     = $('#chart_peak_listeners').highcharts();
    // отдельное включение для графика total
    if (mount_name === 'Total') {
      rebuilding_recalculation_total(CONTEXT, chart);
      return;
    }

    fn.each_value(CONTEXT.get('mountList'), function(mountItem) {
      var current_mount_name   = mountItem.name,
          current_mount_stream = mountItem.mount;
      if (current_mount_name === mount_name) {
        var data_for_chart = CONTEXT['Highcharts_data'][current_mount_name+'::::'+current_mount_stream];
        chart.addSeries(
          work_highcharts.set_chart_option(current_mount_name, data_for_chart)
        );
        chart.redraw();
      }
    });

    // Когда включили какой-то график (и Total включен),
    // то заново строим график total
    if (CONTEXT.get('list_chartsColumns')['Total'] === 1) { rebuilding_recalculation_total(CONTEXT, chart); }
  }


  function turn_off_chart (CONTEXT, mount_name) {
    var chart = $('#chart_peak_listeners').highcharts();
    for (var i = 0, l = chart.series.length; i < l; i++) {
      if (chart.series[i] && chart.series[i].name && chart.series[i].name === mount_name) {
        chart.series[i].remove();
        chart.redraw();
      }
    }

    // Когда отключили какой-то график (не Total),
    // то заново строим график total
    if (CONTEXT.get('list_chartsColumns')['Total'] === 1) { rebuilding_recalculation_total(CONTEXT, chart); }
  }


  // пересчет и перестроение графика total
  // chart –– $('#id')
  function rebuilding_recalculation_total (CONTEXT, chart) {
    work_highcharts.remove_chart(chart, 'Total');
    work_highcharts.add_chart(chart,
      html_chart_total(
        data_chart_total(
          CONTEXT,
          get_array_on_columnCharts(CONTEXT.get('list_chartsColumns'))
        )
      )
    );
  }


  // собираем колонки для таблицы
  // hash_on_columnCharts –– {Date: 1, Total: 1, Percent: 1, 7 days ago: 1, Дорожное 64 (без рекламы): 1…}
  // return [ {data: "date, render: (data, type, full, meta), title: "Date"}, {data: "Дорожное 64 (без рекламы)::::/dor_64_no", title: "Дорожное 64 (без рекламы)"}, {}, ...]
  function prepare_columns_for_table (CONTEXT, hash_on_columnCharts) {
    var Table_data = CONTEXT.get('Table_data'),
        columns    = [];

    columns.push({
      data: 'date',
      title: 'Date',
      render: function(data, type, full, meta) {
        return (type === 'display') ?
        // if useUTC: moment.utc(data), то добавляем/отнимаем cдвиг по времени,
        // к тому времени что пришло с сервера
        // Если этого не делать, то надо руками на сервер добавлять
        // (например, для МSK это будет - 3 часа)
        // var date = new Date((start_day_sec + i * step_sec) * 1000).getTime();
        // moment.utc(data).format('DD-MM-YYYY HH:mm') : data;
          moment(data).format('DD-MM-YYYY HH:mm') : data;
      }
    });
    fn.each(Table_data, function(mount, data) {
      var mount_name = mount.split('::::')[0];
      if (hash_on_columnCharts[mount_name] === 0) {return;}
      // нельзя в DataTable в ключах колонок  использовать использовать точку
      var mount_for_table = mount.replace('.', '');
      // data –– возможно в будущем использвать не сложный ключ с ::::, а просто имя радио без stream
      columns.push({ data: mount_for_table, title: mount_name });
    });
    if (hash_on_columnCharts['Total'] === 1) { columns.push({ data: 'total', title: 'Total' }); }
    columns.push({ data: '7days_ago', title: '7 days ago' });
    columns.push({
      data: 'percent',
      title: 'Percent',
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        if (sData > 0)
          $(nTd).addClass('success');
        else if (sData < 0)
          $(nTd).addClass('danger');
        $(nTd).css('text-align', 'center');
      }
    });
    return columns;
  }


  // собираем данные для таблицы
  // hash_on_columnCharts –– {Date: 1, Total: 1, Percent: 1, 7 days ago: 1, Дорожное 64 (без рекламы): 1…}
  // return [ { 7days_ago: 190, BlackStarRadio::::/blackstarradio128mp3: 0, date: 1455580800000, percent: "53.43", total: 408, Дорожное 64 (без рекламы)::::/dor_64_no: 408 }, {}, ...]
  function prepare_data_for_table (CONTEXT, hash_on_columnCharts) {
    var table_data           = [],
        Table_data           = CONTEXT.get('Table_data'),
        Table_data_7days_ago = CONTEXT.get('Table_data_7days_ago');

    var mount        = CONTEXT.get('mountList')[0].name, // TODO: защитить от ошибок (поставить тесты)
        stream       = CONTEXT.get('mountList')[0].mount,
        Total_length = Table_data[mount+'::::'+stream].length || 0;

    for (var i = 0; i < Total_length; i++) {
      var step_data       = {},
          total           = 0,
          total_7days_ago = 0;
      fn.each(Table_data, function(mount, data) {
        // step_data.date                    =  parseInt(data[i][0], 10)-(3 * 60 * 60 * 1000); // вычитаю 3 часа в мс (из-за highcharts)
        step_data.date                    = data[i][0]; // date
        // возможно в будущем ключом можно использовать
        // не сложный ключ с ::::, а просто имя радио без stream
        var mount_name           = mount.replace(/::::.+$/, ''),
            mount_name_for_table = mount.replace('.', ''); // нельзя в DataTable в ключах колонок  использовать использовать точку
        if (hash_on_columnCharts[mount_name] === 1) {
          step_data[mount_name_for_table] = data[i][1]; // value listeners
          total           += data[i][1];
          total_7days_ago += (Table_data_7days_ago[mount][i]) ? Table_data_7days_ago[mount][i][1] : 0; // value listeners 7 days ago
        }
      });
      if (hash_on_columnCharts['Total'] === 1) { step_data.total = total; }
      step_data['7days_ago'] = total_7days_ago;
      step_data.percent      = (100 - total_7days_ago / total * 100).toFixed(2);
      table_data.push(step_data);
    }
    return table_data;
  }


  // render таблицы с данными
  // columns_visible {Date:1,  Дорожное 64 (без рекламы):0,  BlackStarRadio:1, ...}
  // function render_table (result, columns_visible) {
  function render_table (columns, data) {
    clearTableIfExist('#table_peak_listeners');
    var table = $('#table_peak_listeners').DataTable({
      pageLength: 24,
      data      : data,
      columns   : columns,
      lengthMenu: [[24, 48, 72, -1], [24, 48, 72, "All"]],
      dom       : domDefault(),
      buttons   : dtButtons('PeakListeners'),
    });
    // add buttons and wrap
    table.buttons().container().appendTo( '#table_peak_listeners_wrapper .col-sm-6:eq(0)' );
  }


  // прячем кнопки для таблицы
  // уничтожаем таблицу
  // заново иницилизируем checkbox
  function clean_checkboxTable () {
    var table_with_wrapper = $('#table_peak_listeners_wrapper') || null;
    if (table_with_wrapper) { table_with_wrapper.fadeOut(1000); }
    clearTableIfExist('#table_peak_listeners'); // функция сама определяет есть ли таблица
    getByID('data_managment').innerHTML = '<p style=text-align:center;color:#999>Loading...</p>';
  }


  // если нет данных от СЕРВЕРА рисуем сообщение
  function html_warning () {
    var text = 'Извините, данные за выбранный промежуток времени отсутствуют. Попробуйте выбрать другой диапозон.';
    var html = '';
    html += '<span style="font-size:200%;color:#EC4B4B">'+text+'<span>';
    // заменяем график на текст с сообщениям о том что данных нет
    getByID('chart_peak_listeners').innerHTML = html;
    // чистим блок для checkbox
    getByID('data_managment').innerHTML = '';
  }

}());