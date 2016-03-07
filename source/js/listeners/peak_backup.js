/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

function CONST_LISTENERS_PEAK_DAYS_AGO() {
    return 7;
}

function requestPeakListenersChartData() {
    initDatepicker(sendPeakListenersRequest);
    sendPeakListenersRequest();
}

function sendPeakListenersRequest() {
    drawPeakListenersChart();

    var range = getDateRange();
    var mountList = getSelectedMounts();

    var chart = $('#chart_peak_listeners').highcharts();

    chart.showLoading();

    CONTEXT.mountList = mountList;
    var count = objectLength(mountList);
    for (var key in mountList) {
        var mountItem = mountList[key];
        // continue;
        count--;
        (function (ave_count) {
          getPeakListenersByMount(chart, range, mountItem, ave_count);
        }(count));
        // getPeakListenersByMount(chart, range, mountItem, count);
    }
    // html_data_managment(data_managment());
    // set_events_data_managment();
    console.table(CONTEXT.mountList);
    // throw('STOP_1');
    // Строим таблицу
    sendTablePeakListenersRequests();
}

function getPeakListenersByMount(chart, range, mountItem, count) {
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
                if (!CONTEXT['mountItem']) { CONTEXT['mountItem']={}; }
                CONTEXT['mountItem'][mountItem.mount_id] = seriesOptions[item.index];

                chart.addSeries(seriesOptions[item.index]);

                chart.hideLoading();
                chart.redraw();
                // Если все запросы отработали то вызываем набор функций
                if (!count) {
                  html_data_managment(data_managment());
                  set_events_data_managment();
                }

               //drawPeakListenersSummaryChart(sumPeakListenersArrays(seriesOptions));
           }
          );
}

function data_managment () {
  var mountList = CONTEXT.mountList,
      res       = [];
  for (var key in mountList) {
    if (mountList.hasOwnProperty(key)) {
      var mountItem = mountList[key];
      res.push(mountItem.name);
    }
  }
  return res;
}


function html_data_managment (data) {
  var html = '';
  html += '<div>';
    for (var i = 0, l = data.length; i < l; i++) {
      var el = data[i];
      if (el) {
        html += '<input id=data_managment_'+(i+1)+' type=checkbox value="'+el+'" checked/>'+el;
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
    var input = getByID(full_id) || null;
    if (input.checked === true) {
      turn_on_chart(input.value);
      turn_on_column(input.value);
    } else if (input.checked === false) {
      turn_off_chart(input.value);
      turn_off_column(input.value);
    }
  }


}


function turn_on_column (column_title) {
  var list_columns           = CONTEXT['list_columns'];
  list_columns[column_title] = 1;
  // log('list_columns = ', list_columns);
  clearTableIfExist('#table_peak_listeners');
  loadPeakListenersTable(CONTEXT['prepareFieldsForPeakListenersTable'], list_columns);
}


function turn_off_column (column_title) {
  var list_columns           = CONTEXT['list_columns'];
  list_columns[column_title] = 0;
  // log('list_columns = ', list_columns);
  clearTableIfExist('#table_peak_listeners');
  loadPeakListenersTable(CONTEXT['prepareFieldsForPeakListenersTable'], list_columns);
}

function turn_on_chart (mount_name) {
  var chart     = $('#chart_peak_listeners').highcharts(),
      mountList = CONTEXT.mountList;
  for (var key in mountList) {
    if (mountList.hasOwnProperty(key)) {
      var mountItem = mountList[key];
      if (mountItem.name === mount_name) {
        var data_for_chart = CONTEXT['mountItem'][mountItem.mount_id];
        chart.addSeries(data_for_chart);
        chart.redraw();
      }
    }
  }
}


function turn_off_chart (mount_name) {
  var chart = $('#chart_peak_listeners').highcharts();
  for (var i = 0, l = chart.series.length; i < l; i++) {
    if (chart.series[i] && chart.series[i].name && chart.series[i].name === mount_name) {
      chart.series[i].remove();
      chart.redraw();
    }
  }
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
    for (var key in mountList) {
        var mountItem = mountList[key];
        var job       = getTablePeakListenersDataByMount(range, mountItem);
        jobs.push(job);
    }

    peakListenersTableData = [];
    $.when.apply($, jobs).then(function() {
        var result              = prepareFieldsForPeakListenersTable();
        CONTEXT['prepareFieldsForPeakListenersTable'] = result;
        CONTEXT['list_columns']                       = get_list_columns(result.columns);
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

    log('peakListenersTableData = ', peakListenersTableData);
    for (var i = 0; i < peakListenersTableData.length; i++) {
        var item = peakListenersTableData[i];
        log('item = ', item);
        var name = 'total_'+item.mountItem.mount_id;
        console.log({ title: item.mountItem.name, data: name });
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
              log('tableItem = ', tableItem)
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
    CONTEXT.table_columns = columns;

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