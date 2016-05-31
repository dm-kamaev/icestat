/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// ОПИСАНИЕ СКРИПТА

var show_country = (function () {
  "use strict";
  var TREE = {
    main                    : { id: 'main' },
    datarange               : { id: 'main_1' },
    button_get_data         : { id: 'main_2', style: 'style=margin-top:50px;text-align:center'},
    charts                  : { id: 'main_3'},
    button_exportExcel_table: { id: 'main_4' },
  };

  var start = function () {
    // TODO: костыль в будущем надо перейти на TREE по DOM
    // getByID('main').insertAdjacentHTML('beforeEnd', '<div id="main_1" style="margin-top:20px;text-align:center"><button type="button" style="width:25%;font-size:140%;" class="btn btn-success">Get data</button></div>');
    // getByID('main_1').onclick = sendMapByCountryListenersRequest;

    getByID(TREE.main.id).innerHTML      = html_containers();
    getByID(TREE.datarange.id).innerHTML = work_daterangepicker.get_html_daterange();

    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    work_daterangepicker.changed_datepicker(sendMapByCountryListenersRequest); // вешаем функцию на изменение даты

    getByID(TREE.button_get_data.id).innerHTML = html_buttons.get_data();
    getByID(TREE.button_get_data.id).onclick   = sendMapByCountryListenersRequest;
  };
  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start : start };

  var mCurrentMapByCountryResultList = null;

  function sendMapByCountryListenersRequest() {
      getByID(TREE.button_get_data.id).innerHTML = ''; // убираем кнопку
      setHighchartUseUTC(true);
      var range = getDateRange();
      work_cookie.set_range(range); // добавляем в cookie диапазаон дат
      $('#table_country_listeners').fadeOut(1000);
      $.post('/api/listeners/map/country',
          {
              startDate: range[0],
              endDate: range[1],
              mounts: JSON.stringify(getSelectedMounts())
          },
          function (result, textStatus, jqXHR) {
            var categories = {};
            fn.each_value(result, function(station) {
              // log('station = ', station);
              fn.each(station, function(country) {
                // log('country = ', country);
                categories[country] = 1;
              });
            });
            render_charts(TREE.charts.id, objectKeys(categories), []);
            // setTimeout(function() { throw('STOP_1'); }, 4000);

              // mCurrentMapByCountryResultList = result;
              // var data = {};
              // for (var i = 0; i < result.length; i++) {
              //     var records = result[i].data.Records;
              //     for (var j = 0; j < records.length; j++) {
              //         var record = records[j];
              //         var code = record.code;
              //         if (data[code]) {
              //             data[code] += record.value;
              //         } else {
              //             data[code] = record.value;
              //         }
              //     }
              // }

              // var items = [];
              // for (var key in data) {
              //     var item = {};
              //     if (key.length === 0) item.name = "Other";
              //     else item.name = key;
              //     item.value = data[key];
              //     items.push(item);
              // }

              // items = items.sort(function(a,b) {
              //     return b.value - a.value;
              // });

              // data = [];
              // var categories = [];
              // for (var k = 0; k < items.length; k++) {
              //     var citem = items[k];
              //     if (citem.value >= items[0].value * 0.01) {
              //         var countryName = get_country_name(citem.name);
              //         if (countryName)
              //             categories.push(countryName);
              //         else categories.push(citem.name);
              //         data.push(citem.value);
              //     }
              // }

              // drawMapByCountryListenersChart(data, categories);

              // data = prepareFieldsForCountryTable();
              // clearTableIfExist('#table_country_listeners');
              // log('for table', data);
              // loadCountryListenersTable(data);
              // $('#table_country_listeners').fadeIn(1000);
          }
      );
  }

  function prepareFieldsForCountryTable() {
      var result = {};

      var columns = [];
      var dataSet = [];

      columns.push({ title: 'Country', data: 'country' });

      for (var i = 0; i < mCurrentMapByCountryResultList.length; i++) {
          var item = mCurrentMapByCountryResultList[i].mountItem;
          var name = 'total_' + item.mount_id;
          columns.push({ title: item.name, data: name, defaultContent: '' });

          var records = mCurrentMapByCountryResultList[i].data.Records;
          if (dataSet.length === 0) {
              for (var j = 0; j < records.length; j++) {
                  var record = records[j];
                  var tableItem = {};
                  tableItem.code = record.code ? record.code : 'Other';
                  // tableItem.country = countries[record.code] ? countries[record.code] : "Other";
                  tableItem.country = get_country_name(record.code) || 'Other';
                  tableItem[name] = record.value;
                  tableItem.total = record.value;
                  dataSet.push(tableItem);
              }
          } else {
              for (var k = 0; k < records.length; k++) {
                  var column_record = records[k];

                  var found = false;
                  for (var m = 0; m < dataSet.length; m++) {
                      var code = column_record.code ? column_record.code : "Other";
                      if (dataSet[m].code == code) {
                          dataSet[m][name] = column_record.value;
                          dataSet[m].total += column_record.value;
                          found = true;
                          break;
                      }
                  }

                  if (!found) {
                      var tItem = {};
                      tItem.code = column_record.code ? column_record.code : "Other";
                      // tItem.country = countries[column_record.code] ? countries[column_record.code] : "Other";
                      tableItem.country = get_country_name(record.code) || 'Other';
                      tItem[name] = column_record.value;
                      tItem.total = column_record.value;
                      dataSet.push(tItem);
                  }
              }
          }
      }

      if (mCurrentMapByCountryResultList.length > 1)
          columns.push({ title: 'Total', data: 'total' });

      result.columns = columns;
      result.dataSet = dataSet;
      return result;

  }

  function loadCountryListenersTable(result) {
      var table = $('#table_country_listeners').DataTable({
          "order": [[ result.columns.length - 1, "desc" ]],
          data: result.dataSet,
          columns: result.columns,
          dom: domDefault(),
          buttons: dtButtons('CountryListeners')
      });

      dtAssignButtons(table);
  }

  function getMountsInfoByCountryCode(code) {
      var data = {};
      for (var i = 0; i < mCurrentMapByCountryResultList.length; i++) {
          var name = mCurrentMapByCountryResultList[i].mountItem.name;
          var records = mCurrentMapByCountryResultList[i].data.Records;
          for (var j = 0; j < records.length; j++) {
              var record = records[j];
              if (code == record.code) {
                  data[name] = record.value;
              }
          }
      }
      return data;
  }

  // categories – ["Russia", "Ukraine", "Kazakhstan", "Belarus"],
  // data       – ["Russia", "Ukraine", "Kazakhstan", "Belarus"],
  function render_charts (id, categories, data) {
    console.log('categories = ', categories);
    Highcharts.setOptions({
      lang: {
        decimalPoint: ',',
        thousandsSep: ' '
      }
    });
    $('#'+id).highcharts({
      chart: {
        type: 'bar'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Listeners by Country'
      },
      xAxis: {
        categories: categories,
        title: {
          text: null
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: null
        },
        labels: {
          overflow: 'justify'
        }
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      legend: {
        enabled: false,
      },
      series: [{
        name: 'Listeners',
        data: [1,101,1],
      }]
    });
  }


  function html_containers () {
    var html = '';
    html+='<div id='+TREE.main.id+'>';
      html+='<div id='+TREE.datarange.id+'></div>';
      html+='<div id='+TREE.button_get_data.id+' '+TREE.button_get_data.style+'></div>';
      html+='<div id='+TREE.charts.id+'></div>';
      html+='<div id='+TREE.button_exportExcel_table.id+'></div>';
    html+='</div>';
    return html;
  }

}());


