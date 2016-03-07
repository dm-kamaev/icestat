function requestListenersWhenStartChartData() {
    initDatepicker(sendListenersWhenStartRequest);
    sendListenersWhenStartRequest();
}

function sendListenersWhenStartRequest() {
    setHighchartUseUTC(true);
    var range = getDateRange();
    $.post('/api/listeners/when/start',
           {
               startDate: range[0],
               endDate: range[1],
               mounts: JSON.stringify(getSelectedMounts())
           },
           function (results, textStatus, jqXHR) {
               drawListenersWhenStartChart();

               var seriesOptions = [];
               var chart = $('#chart_listeners_when_start').highcharts();
               for (var i = 0; i < results.length; i++) {
                   var item = results[i];

                   item.index = i;

                   item.color = getRandomColor();

                   var data = prepareListenersWhenStartData(item);
                   seriesOptions[item.index] = {
                       id: 'series-' + item.mountItem.mount.replace('/',''),
                       name: item.mountItem.name,
                       data: data,
                       color: item.color
                   };
                   chart.addSeries(seriesOptions[item.index]);

                   chart.redraw();
               }

               //drawListenersWhenStartSummaryChart(sumListenersWhenStartArrays(seriesOptions));
           }
          );
}

function sumListenersWhenStartArrays(series) {
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
}

function prepareListenersWhenStartData(item) {
    var data = [];
    var records = item.data.Records;
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var chart_item = [];
        chart_item.push(moment.utc(record.time).valueOf());
        chart_item.push(record.count);
        data.push(chart_item);
    }
    data = data.sort(function(a,b) {
        return a[0] - b[0];
    });
    return data;
}

function drawListenersWhenStartChart() {
    $('#chart_listeners_when_start').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Number of listeners when start playing',
        },
        credits: {
            text: '',
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var index = this.series.data.indexOf(this.point);
                var nextHour = moment.utc(this.x).add(1, 'hours');
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
        }
    });
}

/*function drawListenersWhenStartSummaryChart(values) {
    $('#chart_listeners_when_start_sum').highcharts({
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
                var nextHour = moment.utc(this.x).add(1, 'hours');
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
                name: 'Listeners',
                color: getRandomColor(),//'#7cb5ec',
                fillOpacity: 1,
                type: 'line',
                showInLegend: false,
                data: values
            }]
        });
}*/
