function requestSameTimeListenersChartData() {
    // initDatepicker(sendSameTimeListenersRequest);
    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    // TODO: костыль в будущем надо перейти на TREE по DOM
    getByID('main').insertAdjacentHTML('beforeEnd', '<div id="main_1" style="margin-top:20px;text-align:center"><button type="button" style="width:25%;font-size:140%;" class="btn btn-success">Get data</button></div>');
    getByID('main_1').onclick = sendSameTimeListenersRequest;
}

function sendSameTimeListenersRequest() {
    getByID('main_1').innerHTML = ''; // убираем кнопку
    // вешаем функцию на изменение даты
    work_daterangepicker.changed_datepicker(sendSameTimeListenersRequest);
    drawSameTimeListenersChart();

    var range = getDateRange();
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат
    var mountList = getSelectedMounts();
    for (var key in mountList) {
        var mountItem = mountList[key];
        getSameTimeListenersByMount(range, mountItem);
    }
}

function getSameTimeListenersByMount(range, mountItem) {
    var chart = $('#chart_same_time_listeners').highcharts();
    chart.showLoading();
    $.post('/api/listeners/same',
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

                var data = prepareSameTimeListenersData(item);
                seriesOptions[item.index] = {
                    id: 'series-' + mountItem.mount.replace('/',''),
                    name: mountItem.name,
                    data: data,
                    color: item.color
                };
                chart.addSeries(seriesOptions[item.index]);

                chart.redraw();

                chart.hideLoading();

               //drawSameTimeListenersSummaryChart(sumSameTimeListenersArrays(seriesOptions));
           }
          );
}

/*function sumSameTimeListenersArrays(series) {
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

function prepareSameTimeListenersData(item) {
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

function drawSameTimeListenersChart() {
    $('#chart_same_time_listeners').highcharts({
        title: {
            text: 'Number of the same time listeners',
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

/*function drawSameTimeListenersSummaryChart(values) {
    $('#chart_same_time_listeners_sum').highcharts({
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
