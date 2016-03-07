var CURRENT_LISTENERS_POINTS_COUNT = 20;

var mCurrentListenersInterval = null;
var mCurrentListenersSummaryInterval = null;

function requestCurrentListenersChartData() {
    setHighchartUseUTC(false);
    var mounts = getSelectedMounts();
    $.post('/api/listeners/current', { mounts: JSON.stringify(mounts) }, function (data, textStatus, jqXHR) {
        updateCurrentListenersChart(data);
        if (user.mounts_multiselect)
            updateCurrentListenersSummaryChart(data);
    }, 'json');
}

function updateCurrentListenersSummaryChart(data) {
    var x = moment().valueOf(),
        y = getTotal(data);

    var point = [x, y];

    var points = [];
    for (var i = 0; i < CURRENT_LISTENERS_POINTS_COUNT; i++)
        points.push(point);

    drawCurrentListenersSummaryChart(points);
}

function updateCurrentListenersChart(data) {
    var seriesOptions = [];
    var chart = $('#chart_current_listeners').highcharts();
    var x = moment().valueOf();
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        item.index = i;
        item.color = getRandomColor();

        var y = parseInt(item.value);
        var point = [x, y];
        var points = [];
        for (var j = 0; j < CURRENT_LISTENERS_POINTS_COUNT; j++)
            points.push(point);

        seriesOptions[item.index] = {
            id: 'series-' + item.index,
            name: item.mountItem.name,
            data: points,
            color: item.color
        };

    }
    drawCurrentListenersChart(seriesOptions);
}

function getTotal(data) {
    var count = 0;
    for (var i = 0; i < data.length; i++) {
        count += parseInt(data[i].value);
    }
    return count;
}

function stopCurrentListenersUpdateInterval() {
    if (mCurrentListenersSummaryInterval)
        clearInterval(mCurrentListenersSummaryInterval);
    if (mCurrentListenersInterval)
        clearInterval(mCurrentListenersInterval);
}

function drawCurrentListenersChart(series) {
    $('#chart_current_listeners').highcharts({
        credits: {
            text: '',
        },
        chart : {
            type: 'spline',
            animation: true, // don't animate in old IE
            marginRight: 10,
            events : {
                load : function () {
                    var series = this.series;
                    mCurrentListenersSummaryInterval = setInterval(function () {
                        var mounts = getSelectedMounts();
                        $.post('/api/listeners/current', { mounts: JSON.stringify(mounts) }, function (data, textStatus, jqXHR) {
                            var x = moment().valueOf();
                            for (var i = 0; i < data.length; i++) {
                                var y = parseInt(data[i].value);
                                series[i].addPoint([x, y], true, true);
                            }
                        }, 'json');
                    }, 1000);
                }
            }
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var index = this.series.data.indexOf(this.point);
                var result = '<text x="8" zIndex="1" style="font-family:arial;" transform="translate(0,20)">' +
                    '<tspan style="font-size:10px;">'+ Highcharts.dateFormat('%A, %b %e, %Y, %H:%M:%S', this.x) +'</tspan>' +
                        '</br><tspan style="color:#7cb5ec" x="8" dy="15">●</tspan>' +
                            '<tspan dx="0"> Listeners:  </tspan>' +
                                '<tspan style="font-weight:bold" dx="0">' + Highcharts.numberFormat(this.y,0) + '</tspan>' +
                                    '</text>';
                                    return result;
            }
        },
        title : {
            text : 'Current Listeners'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: ''
            },
            gridLineColor: 'transparent'
        },
        exporting: {
            enabled: false
        },
        series: series
    });
}

function drawCurrentListenersSummaryChart(values) {
    $('#chart_current_listeners_sum').highcharts({
        credits: {
            text: '',
        },
        chart : {
            type: 'spline',
            animation: true, // don't animate in old IE
            marginRight: 10,
            events : {
                load : function () {
                    var series = this.series[0];
                    mCurrentListenersInterval = setInterval(function () {
                        var mounts = getSelectedMounts();
                        $.post('/api/listeners/current', { mounts: JSON.stringify(mounts) }, function (data, textStatus, jqXHR) {
                            var x = moment().valueOf(),
                                y = getTotal(data);
                                series.addPoint([x, y], true, true);
                        }, 'json');
                    }, 1000);
                }
            }
        },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var index = this.series.data.indexOf(this.point);
                var result = '<text x="8" zIndex="1" style="font-family:arial;" transform="translate(0,20)">' +
                    '<tspan style="font-size:10px;">'+ Highcharts.dateFormat('%A, %b %e, %Y, %H:%M:%S', this.x) +'</tspan>' +
                        '</br><tspan style="color:#7cb5ec" x="8" dy="15">●</tspan>' +
                            '<tspan dx="0"> Listeners:  </tspan>' +
                                '<tspan style="font-weight:bold" dx="0">' + Highcharts.numberFormat(this.y,0) + '</tspan>' +
                                    '</text>';
                                    return result;
            }
        },
        title : {
            text : 'Summary'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: ''
            },
            gridLineColor: 'transparent'
        },
        exporting: {
            enabled: false
        },
        series : [{
            name : 'Current Listeners',
            type : 'line',
            color: '#7cb5ec',
            fillOpacity: 1,
            showInLegend: false,
            data : values
        }]
    });
}
