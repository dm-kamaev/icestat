function requestOtherDurationsChartData() {
    // initDatepicker(sendOtherDurationsRequest);
    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    // TODO: костыль в будущем надо перейти на TREE по DOM
    // getByID('main').insertAdjacentHTML('beforeEnd', '<div id="main_1" style="margin-top:20px;text-align:center"><button type="button" style="width:25%;font-size:140%;" class="btn btn-success">Get data</button></div>');
    getByClass('input-group input-daterange').insertAdjacentHTML('afterEnd', '<div id="main_1" style="margin-top:20px;text-align:center"><button type="button" style="width:25%;font-size:140%;" class="btn btn-success">Get data</button></div>');
    getByID('main_1').onclick = sendOtherDurationsRequest;
}

function sendOtherDurationsRequest() {
    getByID('main_1').innerHTML = ''; // убираем кнопку
    // вешаем функцию на изменение даты
    work_daterangepicker.changed_datepicker(sendOtherDurationsRequest);
    setHighchartUseUTC(true);

    var categories = [
        "Less than 5 minutes",
        "From 5 to 10 minutes",
        "From 10 to 30 minutes",
        "From 30 minutes to 1 hour",
        "From 1 hour to 2 hours",
        "From 2 to 5 hours",
        "More than 5 hours"
    ];

    drawOtherDurationsChart(categories);

    var range = getDateRange();
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат
    var mounts = getSelectedMounts();
    $('#table_other_durations').fadeOut(1000);
    var chart = $('#chart_other_durations').highcharts();
    chart.showLoading();
    $.post('/api/other/durations',
           {
               startDate: range[0],
               endDate: range[1],
               mounts: JSON.stringify(mounts)
           },
           function (result, textStatus, jqXHR) {
               var d_10_30min = 0;
               var d_30m_1h = 0;
               var d_1_2h = 0;
               var d_2_5h = 0;
               var d_more_5h = 0;
               var d_5_10min = 0;
               var d_5min = 0;

               var data = [];
               for (var i = 0; i < result.length; i++) {
                   var records = result[i].data.Records;
                   for (var j = 0; j < records.length; j++) {
                       var item = records[j];
                       d_10_30min += item.d_10_30min;
                       d_30m_1h += item.d_30m_1h;
                       d_1_2h += item.d_1_2h;
                       d_2_5h += item.d_2_5h;
                       d_more_5h += item.d_more_5h;
                       d_5_10min += item.d_5_10min;
                       d_5min += item.d_5min;
                   }
               }

               data.push(d_5min);
               data.push(d_5_10min);
               data.push(d_10_30min);
               data.push(d_30m_1h);
               data.push(d_1_2h);
               data.push(d_2_5h);
               data.push(d_more_5h);

               chart.addSeries({
                   name: 'Durations',
                   data: data
               });

               chart.redraw();
               chart.hideLoading();

               result.categories = categories;
               drawOtherDurationsTable(result, data);
           }
          );
}

function drawOtherDurationsTable(result, totalData) {
    var data = prepareFieldsForOtherDurationsTable(result, totalData);
    clearTableIfExist('#table_other_durations');
    loadOtherDurationsTable(data);
    $('#table_other_durations').fadeIn(1000);
}

function prepareFieldsForOtherDurationsTable(data, totalData) {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({ title: 'Duration', data: 'title' });

    for (var i = 0; i < data.categories.length; i++)
        dataSet.push({title : data.categories[i]});

    for (var p = 0; p < data.length; p++) {
        var item = data[p].mountItem;
        var name = 'total_' + item.mount_id;
        columns.push({ title: item.name, data: name});

        var records = data[p].data.Records;
        for (var j = 0; j < records.length; j++) {
            var record = records[j];
            dataSet[0][name] = record.d_5min;
            dataSet[1][name] = record.d_5_10min;
            dataSet[2][name] = record.d_10_30min;
            dataSet[3][name] = record.d_30m_1h;
            dataSet[4][name] = record.d_1_2h;
            dataSet[5][name] = record.d_2_5h;
            dataSet[6][name] = record.d_more_5h;
        }
    }
    if (data.length > 1) {
        columns.push({ title: 'Total', data: 'total' });
        for (var n = 0; n < totalData.length; n++)
            dataSet[n].total = totalData[n];
    }

    result.columns = columns;
    result.dataSet = dataSet;
    return result;
}

function loadOtherDurationsTable(result) {
    var table = $('#table_other_durations').DataTable( {
        sort: false,
        paging: false,
        searching: false,
        data: result.dataSet,
        columns: result.columns,
        dom: domDefault(),
        buttons: dtButtons('Durations')
    } );

    dtAssignButtons(table);
}

function drawOtherDurationsChart(categories) {
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
            text: 'Durations'
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
            categories:  categories,
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
