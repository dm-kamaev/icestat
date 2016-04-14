/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

// OLD CODE: БОЛЬШЕ НЕ ИСПОЛЬЗУЕТСЯ переместить в папку old/
// TODO: в будущем избавиться
var CONTEXT = add_methods_context({});

function CONST_LISTENERS_PEAK_DAYS_AGO() {
    return 7;
}

function requestPeakListenersChartData() {
    initDatepicker(sendPeakListenersRequest);
    sendPeakListenersRequest();
}


function sendPeakListenersRequest() {
    clean_checkboxTable(); // заново иницилизуруем таблицу и checkbox

    drawPeakListenersChart();

    var range     = getDateRange(),
        mountList = getSelectedMounts();

    var chart = $('#chart_peak_listeners').highcharts();

    chart.showLoading();

    CONTEXT['mountList'] = mountList;
    /*
      Хэш с данными для постройки и перерисовки графиков
      {
        2: {
          id:    'series-' + mountItem.mount.replace('/',''),
          name:  mountItem.name,
          data:  data,
          color: item.color
        },
        20: {...},
      }
    */
    CONTEXT['mountItems'] = {};
    var promise = CPromise();
    for (var key in mountList) {
      (function (average_key) {
        promise.then(function(next) {
          getPeakListenersByMount(chart, range, mountList[average_key], next);
        });
      }(key));
    }
    promise.end(function(err, res) {
      // console.log('Promises series: ', err || res);
      // Строим таблицу и checkbox
      sendTablePeakListenersRequests();
    });

}


// Получаем данные для графиков и сразу добавляем в highcharts
function getPeakListenersByMount(chart, range, mountItem, next) {
    $.post('/api/listeners/peak',
           {
               startDate: range[0],
               endDate: range[1],
               mountItem: JSON.stringify(mountItem)
           },
           function (result, textStatus, jqXHR) {
                var seriesOptions = [];
                var item          = {};

                item.data  = result;
                item.color = getRandomColor();
                item.index = mountItem.mount_id;

                var data = preparePeakListenersData(item);
                seriesOptions[item.index] = {
                    id:    'series-' + mountItem.mount.replace('/',''),
                    name:  mountItem.name,
                    data:  data,
                    color: item.color
                };
                // сохраняем данные чтобы для перерисовки графика их вставлять
                CONTEXT['mountItems'][mountItem.mount_id] = seriesOptions[item.index];

                chart.addSeries(seriesOptions[item.index]);

                chart.hideLoading();
                chart.redraw();
                next(null, mountItem.name);
               //drawPeakListenersSummaryChart(sumPeakListenersArrays(seriesOptions));
           }
          );
}


// вычисляем total для графика
// на выходе двумерный массив [[x, y], [x, y], ...]
// x - время, y - пользователи
function data_chart_total () {
  /* { data: [[x, y], [x, y], ...], ... }*/
  var mountItems = CONTEXT['mountItems'],
      res        = [];

  var init_res = function (length) {
    for (var i = 0; i < length; i++) { res[i] = [0, 0]; }
  };

  var List_columns = CONTEXT.get('list_columns');
  fn.each_value(mountItems, function(data_for_chart) {
    var mount_name = data_for_chart.name;
    // сам total не складываем; выключенный график/колонка таблицы не участвует;
    if (mount_name === 'Total' || List_columns[mount_name] === 0) { return; }
    var coordinates = data_for_chart.data; // [[x, y], [x, y], ...]
    var l           = coordinates.length;
    if (res.length === 0) { init_res(l); }
    for (var i = 0; i < l; i++) {
      if (res[i][0] === 0) {res[i][0] += coordinates[i][0];}
      res[i][1] += coordinates[i][1];
    }
    // console.log('data_for_chart[8] = ', data_for_chart.data[8]);
  });
  // console.log('res', res);
  return res;
}


// отрисовка графика total и возврат данных для highcharts()
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


// ны выход имена радио для checkbox ["Дорожное 64 (без рекламы)", "BlackStarRadio"]
function data_managment () {
  var mountList = CONTEXT.mountList,
      res       = [];
  fn.each_value(mountList, function(mountItem) {
    res.push(mountItem.name);
  });
  res.push('Total');
  return res;
}


// view for checkbox
function html_data_managment (data) {
  var html = '';
  html += '<div style=text-align:center>';
    for (var i = 0, l = data.length; i < l; i++) {
      var el = data[i];
      if (el) {
        html += '<label class=checkbox-inline>';
          html +='<input id=data_managment_'+(i+1)+' type=checkbox value="'+el+'" checked>'+el;
        html +='</label>';
      }
    }
  html += '</div>';
  getByID('data_managment').innerHTML = html;
}


function set_events_data_managment () {
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
    var input        = getByID(full_id) || null;
        list_columns = CONTEXT.get('list_columns'),
        mount_name   = input.value;
    if (input.checked === true) {
      list_columns[mount_name] = 1;
      turn_on_chart(mount_name);
      turn_on_column(mount_name);
    } else if (input.checked === false) {
      list_columns[mount_name] = 0;
      turn_off_chart(mount_name);
      turn_off_column(mount_name);
    }
  };


}


function turn_on_chart (mount_name) {
  var chart     = $('#chart_peak_listeners').highcharts(),
      mountList = CONTEXT.get('mountList');

  // отдельное включение для графика total
  if (mount_name === 'Total') {
    rebuilding_recalculation_total(chart);
    return;
  }

  fn.each_value(mountList, function(mountItem) {
    if (mountItem.name === mount_name) {
      var data_for_chart = CONTEXT['mountItems'][mountItem.mount_id];
      chart.addSeries(data_for_chart);
      chart.redraw();
    }
  });

  var List_columns = CONTEXT.get('list_columns');
  // Когда включили какой-то график (и Total включен),
  // то заново строим график total
  if (List_columns['Total'] === 1) { rebuilding_recalculation_total(chart); }
}


function turn_off_chart (mount_name) {
  var chart = $('#chart_peak_listeners').highcharts();
  for (var i = 0, l = chart.series.length; i < l; i++) {
    if (chart.series[i] && chart.series[i].name && chart.series[i].name === mount_name) {
      chart.series[i].remove();
      chart.redraw();
    }
  }

  var List_columns = CONTEXT.get('list_columns');
  // Когда отключили какой-то график (не Total),
  // то заново строим график total
  if (List_columns['Total'] === 1) { rebuilding_recalculation_total(chart); }
}


// пересчет и перестроение графика total
function rebuilding_recalculation_total (chart) {
  work_highcharts.remove_chart(chart, 'Total');
  work_highcharts.add_chart(chart, html_chart_total(data_chart_total()));
}


function turn_on_column () {
  clearTableIfExist('#table_peak_listeners');
  loadPeakListenersTable(recalculation_table(), CONTEXT.get('list_columns'));
}


function turn_off_column () {
  clearTableIfExist('#table_peak_listeners');
  loadPeakListenersTable(recalculation_table(), CONTEXT.get('list_columns'));
}


/*function sumPeakListenersArrays(series) {
    var result = {};
    for (var i = 0; i < series.length; i++) {
        var arr = series[i].data;
        for (var j = 0; j < arr.length; j++) {
            var item = arr[j];
            var date = item[0];
            if (result[date]) {
                result[date] += item[1];
            } else {
                result[date] = item[1];
            }
        }
    }
    var data = [];
    for (var key in result) {
        data.push([key, result[key]]);
    }
    data = data.sort(function(a,b) {
        return a[0] - b[0];
    });
    return data;
}*/

function preparePeakListenersData(item) {
    var data = [];
    var rows = item.data;
    for (var i = 0; i < rows.length; i++) {
        var record = rows[i];
        var chart_item = [];
        chart_item.push(moment(record.step_date).valueOf());
        chart_item.push(record.total);
        data.push(chart_item);
    }
    return data;
}

function drawPeakListenersChart() {
    $('#chart_peak_listeners').highcharts({
        title: {
            text: 'Number of the peak time listeners',
        },
        credits: {
            text: '',
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var index = this.series.data.indexOf(this.point);
                var result = '<text x="8" zIndex="1" style="font-family:arial;" transform="translate(0,20)">' +
                             '<tspan style="font-size:10px;">'+ Highcharts.dateFormat('%A, %b %e, %Y, %H:%M', this.x) + '</tspan>' +
                             '</br><tspan style="color:#7cb5ec" x="8" dy="15">●</tspan>' +
                             '<tspan dx="0"> Listeners:  </tspan>' +
                             '<tspan style="font-weight:bold" dx="0">' + Highcharts.numberFormat(this.y,0) + '</tspan>' +
                             '</text>';
                return result;
            }
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

/*function drawPeakListenersSummaryChart(values) {
    $('#chart_peak_listeners_sum').highcharts({
        title: {
            text: 'Summary',
        },
        credits: {
            text: '',
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var index = this.series.data.indexOf(this.point);
                var nextHour = moment(this.x).add(1, 'hours');
                var strNextHour = Highcharts.dateFormat("%H:%M", nextHour);
                var result = '<text x="8" zIndex="1" style="font-family:arial;" transform="translate(0,20)">' +
                             '<tspan style="font-size:10px;">'+ Highcharts.dateFormat('%A, %b %e, %Y, %H:%M', this.x) + "-" + strNextHour + '</tspan>' +
                             '</br><tspan style="color:#7cb5ec" x="8" dy="15">●</tspan>' +
                             '<tspan dx="0"> Listeners:  </tspan>' +
                             '<tspan style="font-weight:bold" dx="0">' + Highcharts.numberFormat(this.y,0) + '</tspan>' +
                             '</text>';
                return result;
            }
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
                pointInterval: 3600 * 1000
            }
        },
        series: [{
                name: 'Same time listeners',
                color: getRandomColor(),//'#7cb5ec',
                fillOpacity: 1,
                type: 'line',
                showInLegend: false,
                data: values
            }]
        });
}*/

function sendTablePeakListenersRequests() {
    var range     = getDateRange();
    var mountList = getSelectedMounts();

    $('#table_peak_listeners').fadeOut(1000);

    var jobs = [];
    // глобальный массив с данными для таблицы
    peakListenersTableData = [];
    for (var key in mountList) {
        var mountItem = mountList[key];
        var job       = getTablePeakListenersDataByMount(range, mountItem);
        jobs.push(job);
    }

    $.when.apply($, jobs).then(function() {
        var result = prepareFieldsForPeakListenersTable();
        CONTEXT['prepareFieldsForPeakListenersTable'] = result;
        CONTEXT['list_columns']                       = get_list_columns(result.columns);

        var data_for_chart_total = html_chart_total(data_chart_total());
        work_highcharts.add_chart('#chart_peak_listeners', data_for_chart_total);
        CONTEXT['mountItems']['Total'] = data_for_chart_total;

        html_data_managment(data_managment());
        set_events_data_managment();

        $('#table_peak_listeners').fadeOut(1000);
        clearTableIfExist('#table_peak_listeners');
        loadPeakListenersTable(result);
        $('#table_peak_listeners').fadeIn(1000);

    });
}


function prepareFieldsForPeakListenersTable() {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({
        title: 'Date',
        data: 'date',
        render: function(data, type, full, meta){
            return (type === 'display') ?
                moment.utc(data).format('DD-MM-YYYY HH:mm') : data;
        }
    });

    // console.log('peakListenersTableData = ', peakListenersTableData);
    for (var i = 0; i < peakListenersTableData.length; i++) {
        var item = peakListenersTableData[i];
        var name = 'total_'+item.mountItem.mount_id;
        columns.push({ title: item.mountItem.name, data: name });
        if (dataSet.length === 0) {
            for (var j = 0; j < item.Records.length; j++) {
              var record = item.Records[j];
              var tableItem = {};
              tableItem[name]          = record.total;
              tableItem.date           = record.step_date;
              tableItem.total          = record.total;
              tableItem.totalByDaysAgo = record.totalByDaysAgo;
              tableItem.percent        = (100 - tableItem.totalByDaysAgo / tableItem.total * 100).toFixed(2);
              dataSet.push(tableItem);
            }
        } else {
            for (var k = 0; k < item.Records.length; k++) {
              dataSet[k][name]           = item.Records[k].total;
              dataSet[k].total          += item.Records[k].total;
              dataSet[k].totalByDaysAgo += item.Records[k].totalByDaysAgo;
              dataSet[k].percent         = (100 - dataSet[k].totalByDaysAgo / dataSet[k].total * 100).toFixed(2);
            }
        }
    }
    columns.push({ title: 'Total', data: 'total' });
    columns.push({ title: CONST_LISTENERS_PEAK_DAYS_AGO() + ' days ago', data: 'totalByDaysAgo' });
    columns.push({
        title: 'Percent',
        data: 'percent',
        fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
            if (sData > 0)
                $(nTd).addClass('success');
            else if (sData < 0)
                $(nTd).addClass('danger');
            $(nTd).css('text-align', 'center');
        }
    });

    // сохраняем для перерисовки таблицы
    CONTEXT['table_columns'] = columns;

    result.columns = columns;
    result.dataSet = dataSet;
    return result;
}


function recalculation_table () {
  var result = {};

  var columns = [];
  var dataSet = [];

  columns.push({
    title: 'Date',
    data: 'date',
    render: function(data, type, full, meta) {
      return (type === 'display') ?
        moment.utc(data).format('DD-MM-YYYY HH:mm') : data;
    }
  });

  var List_columns = CONTEXT.get('list_columns');

  for (var i = 0; i < peakListenersTableData.length; i++) {
    var item       = peakListenersTableData[i];
    var mount_name = item.mountItem.name;
    // пропускаем отключенные колонки
    if (List_columns[mount_name] === 0) {continue;}
    var name = 'total_'+item.mountItem.mount_id;
    columns.push({ title: item.mountItem.name, data: name });
    if (dataSet.length === 0) {
      for (var j = 0; j < item.Records.length; j++) {
        var record = item.Records[j];
        var tableItem = {};
        tableItem[name]          = record.total;
        tableItem.date           = record.step_date;
        tableItem.total          = record.total;
        tableItem.totalByDaysAgo = record.totalByDaysAgo;
        tableItem.percent        = (100 - tableItem.totalByDaysAgo / tableItem.total * 100).toFixed(2);
        dataSet.push(tableItem);
      }
    } else {
      for (var k = 0; k < item.Records.length; k++) {
        dataSet[k][name]           = item.Records[k].total;
        dataSet[k].total          += item.Records[k].total;
        dataSet[k].totalByDaysAgo += item.Records[k].totalByDaysAgo;
        dataSet[k].percent         = (100 - dataSet[k].totalByDaysAgo / dataSet[k].total * 100).toFixed(2);
      }
    }
  }

  columns.push({ title: 'Total', data: 'total' });
  columns.push({ title: CONST_LISTENERS_PEAK_DAYS_AGO() + ' days ago', data: 'totalByDaysAgo' });
  columns.push({
    title: 'Percent',
    data: 'percent',
    fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
      if (sData > 0) {
        $(nTd).addClass('success');
      } else if (sData < 0) {
        $(nTd).addClass('danger');
        $(nTd).css('text-align', 'center');
      }
    }
    });

  result.columns = columns;
  result.dataSet = dataSet;
  return result;
}


var peakListenersTableData = [];
function getTablePeakListenersDataByMount(range, mountItem) {
    var postData = {
        startDate: range[0],
        endDate: range[1],
        mountItem: JSON.stringify(mountItem),
        daysAgo: CONST_LISTENERS_PEAK_DAYS_AGO()
    };

    return $.post('/api/listeners/table/peak',
        postData,
        function (data, textStatus, jqXHR) {
            peakListenersTableData.push(data);
        }
    );
}

// render таблицы с данными
// columns_visible {Date:1,  Дорожное 64 (без рекламы):0,  BlackStarRadio:1, ...}
function loadPeakListenersTable(result, columns_visible) {
  if (columns_visible) {
    result.columns = what_columns_to_show(columns_visible);
  }

  // result.dataSet ––
  //  [{ date: "2016-02-24T00:00:00.000Z", percent: "17.19", total: 640, totalByDaysAgo: 530, total_2: 426, total_20: 214}, ... ]

  // result.columns ––    // МНОГИЕ добавляет библилотека DataTable
  // [{data: "total_2", mData: "total_2", sTitle: "Дорожное 64 (без рекламы)", title: "Дорожное 64 (без рекламы)",}, ...]
  // console.log('result.dataSet = ', result.dataSet);
  // console.log('result.columns = ', result.columns);
  var table = $('#table_peak_listeners').DataTable({
    pageLength: 24,
    data:       result.dataSet,
    columns:    result.columns,
    lengthMenu: [[24, 48, 72, -1], [24, 48, 72, "All"]],
    dom:        domDefault(),
    buttons:    dtButtons('PeakListeners'),
  });

  table.buttons().container().appendTo( '#table_peak_listeners_wrapper .col-sm-6:eq(0)' );
}


// список возможных колонок на странице peak
// на вход  массив объектов [{ title:"Date", data:"date", sTitle:"Date", ...}, ...],
// созданный с помощью DataTable
// ны выход хэш { Date:1,  Дорожное 64 (без рекламы):1,  BlackStarRadio:1, ...}
function get_list_columns (columns) {
  var res = {};
  for (var i = 0, l = columns.length; i < l; i++) {
    var column = columns[i];
    if (column) {
      res[column.title] = 1;
    }
  }
  return res;
}


// список возможных колонок на странице peak
// выбираем из массива объектов table_columns
// [{ title:"Date", data:"date", sTitle:"Date", ...}, ...],
// объекты по title
// c помощью сравнения с хэшом columns_visible
// { Date:1,  Дорожное 64 (без рекламы):0,  BlackStarRadio:1, ...}
function what_columns_to_show (columns_visible) {
  var table_columns = CONTEXT.table_columns,
      res = [];
  for (var i = 0, l = table_columns.length; i < l; i++) {
    var el = table_columns[i];
    if (el && columns_visible[el.title]) {
      res.push(el);
    }
  }
  return res;
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