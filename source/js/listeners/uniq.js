function requestUniqListenersChartData() {
    initDatepicker(sendUniqListenersRequest);
    sendUniqListenersRequest();
}


function sendUniqListenersRequest() {
    setHighchartUseUTC(true);
    var range = getDateRange();
    var mounts = getSelectedMounts();
    $.post('/api/listeners/uniq',
           {
               startDate: range[0],
               endDate: range[1],
               mounts: JSON.stringify(mounts)
           },
           function (results, textStatus, jqXHR) {
                var series = [];
                for (var i = 0; i < results.length; i++) {
                    var item = results[i];
                    for (var j = 0; j < item.data.Records.length; j++) {
                        var record = item.data.Records[j];
                        var itemDate = record.date;
                        if (series[j]) {
                            series[j].uniq += record.uniq;
                            series[j].count += record.count;
                        } else {
                            series[j] = record;
                        }
                    }
                }
                drawUniqListenersChart(series);
           }
          );
}

function drawUniqListenersChart(data) {
    var time_arr = [];
    var uniq_arr = [];
    var count_arr = [];

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        time_arr.push(item.date);
        uniq_arr.push(item.uniq);
        count_arr.push(item.count);
    }

    $('#chart_uniq_listeners').highcharts({
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
		credits: {
			text: '',
		},
        title: {
            text: 'Unique listeners'
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
            categories: time_arr,
            labels: {
                rotation: -45,
            }
        },
        yAxis: {
            title: {
                text: null
            }
        },
        series: [{
            name: 'Unique',
            color: '#7cb5ec',
            data: uniq_arr
        },{
            name: 'All',
            color: '#ff8dff',
            data: count_arr
        }]
    });
}
