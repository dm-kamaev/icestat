function initAQHReportPage() {
    initDatepicker(sendAQHReportRequest);
    sendAQHReportRequest();
}

function sendAQHReportRequest() {
    drawAQHListenersChart();

    var range = getDateRange();
    var mountList = getSelectedMounts();

    $('#table_report_aqh').fadeOut(1000);

    var chart = $('#chart_aqh_listeners').highcharts();
    chart.showLoading();

    var jobs = [];
    for (var key in mountList) {
        var mountItem = mountList[key];
        var job = getAQHListenersByMount(chart, range, mountItem);
        jobs.push(job);
    }

    $.when.apply($, jobs).then(function() {
        var result = prepareFieldsForAQHReportTable();
        clearTableIfExist('#table_report_aqh');
        loadAQHReportTable(result);
        $('#table_report_aqh').fadeIn(1000);
    });
}

function prepareFieldsForAQHReportTable() {
    var chart = $('#chart_aqh_listeners').highcharts();
    var series = chart.series;
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({
        title: 'Date',
        data: 'date',
        render: function(data, type, full, meta){
            function getFormatedDate(data) {
                var nextHour = moment.utc(data).add(15, 'minutes');
                var strNextHour = Highcharts.dateFormat("%H:%M", nextHour);
                return moment.utc(data).format('DD-MM-YYYY HH:mm') + '-' + strNextHour;
            }
            return (type === 'display') ?
                getFormatedDate(data) : data;
        }
    });

    for (var i = 0; i < series.length; i++) {
        var item = series[i].options;
        var name = 'total_'+ item.id;
        columns.push({ title: item.name, data: name });
        if (dataSet.length === 0) {
            for (var j = 0; j < item.data.length; j++) {
                var record = item.data[j];
                var tableItem = {};
                tableItem.date = record[0];
                tableItem[name] = record[1];
                tableItem.total = record[1];
                dataSet.push(tableItem);
            }
        } else {
            for (var k = 0; k < item.data.length; k++) {
                var column_record = item.data[k];
                dataSet[k][name] = column_record[1];
                dataSet[k].total += column_record[1];
            }
        }
    }

    if (series.length > 1)
        columns.push({ title: 'Total', data: 'total' });

    result.columns = columns;
    result.dataSet = dataSet;
    return result;
}

function loadAQHReportTable(result) {
    var table = $('#table_report_aqh').DataTable({
        pageLength: 12,
        data: result.dataSet,
        columns: result.columns,
        lengthMenu: [[12, 24, 36, -1], [12, 24, 36, "All"]],
        dom: domDefault(),
        buttons: dtButtons('AverageQuarterHourListeners')
    });

    dtAssignButtons(table);
}

function getAQHListenersByMount(chart, range, mountItem) {
    return $.post('/api/report/aqh',
           {
               startDate: range[0],
               endDate: range[1],
               mountItem: JSON.stringify(mountItem)
           },
           function (result, textStatus, jqXHR) {
                var seriesOptions = [];
                var item = {};

                item.data = result;
                item.color = getRandomColor();
                item.index = mountItem.mount_id;

                var data = prepareAQHListenersData(item);
                seriesOptions[item.index] = {
                    id: 'series_' + mountItem.mount_id,
                    name: mountItem.name,
                    data: data,
                    color: item.color
                };
                chart.addSeries(seriesOptions[item.index]);

                chart.redraw();

                chart.hideLoading();
           }
          );
}

function prepareAQHListenersData(item) {
    var data = [];
    var rows = item.data;
    for (var i = 0; i < rows.length; i++) {
        var record = rows[i];
        var chart_item = [];
        chart_item.push(moment(record.start_date).valueOf());
        chart_item.push(record.total);
        data.push(chart_item);
    }
    return data;
}

function drawAQHListenersChart() {
    $('#chart_aqh_listeners').highcharts({
        title: {
            text: 'Average Quarter Hour',
        },
        chart: {
            type: 'column'
        },
        credits: {
            text: '',
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var index = this.series.data.indexOf(this.point);
                var nextHour = moment(this.x).add(15, 'minutes');
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
                pointInterval: 60 * 15 * 1000
            }
        }
    });
}
