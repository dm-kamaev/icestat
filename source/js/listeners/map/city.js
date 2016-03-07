function requestMapByCityListenersChartData() {
    initDatepicker(sendMapByCityListenersRequest);
    sendMapByCityListenersRequest();
}

var mCurrentMapByCityResultList = null;

function sendMapByCityListenersRequest() {
    setHighchartUseUTC(true);
    var range = getDateRange();
    $('#table_city_listeners').fadeOut(1000);
    $.post('/api/listeners/map/city',
        {
            startDate: range[0],
            endDate: range[1],
            mounts: JSON.stringify(getSelectedMounts())
        },
        function (result, textStatus, jqXHR) {
            mCurrentMapByCityResultList = result;
            var data = {};
            for (var i = 0; i < result.length; i++) {
                var records = result[i].data.Records;
                for (var j = 0; j < records.length; j++) {
                    var record = records[j];
                    var code = record.code;
                    if (data[code]) {
                        data[code] += record.value;
                    } else {
                        data[code] = record.value;
                    }
                }
            }

            var items = [];
            for (var key in data) {
                var item = {};
                if (key.length === 0) item.code = "Other";
                else item.code = key;
                item.value = data[key];
                items.push(item);
            }

            items = items.sort(function(a,b) {
                return b.value - a.value;
            });

            data = [];
            var categories = [];
            for (var k in items) {
                var citem = items[k];
                if (citem.value >= items[0].value * 0.1) {
                    categories.push(citem.code);
                    data.push(citem.value);
                }
            }
            drawMapByCityListenersChart(data, categories);

            data = prepareFieldsForCityTable();
            clearTableIfExist('#table_city_listeners');
            loadCityListenersTable(data);
            $('#table_city_listeners').fadeIn(1000);
        }
    );
}

function prepareFieldsForCityTable() {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({ title: 'City', data: 'code' });

    for (var i = 0; i < mCurrentMapByCityResultList.length; i++) {
        var item = mCurrentMapByCityResultList[i].mountItem;
        var name = 'total_' + item.mount_id;
        columns.push({ title: item.name, data: name, defaultContent: '' });

        var records = mCurrentMapByCityResultList[i].data.Records;
        if (dataSet.length === 0) {
            for (var j = 0; j < records.length; j++) {
                var record = records[j];
                var tableItem = {};
                tableItem.code = record.code ? record.code : "Other";
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
                    tItem[name] = column_record.value;
                    tItem.total = column_record.value;
                    dataSet.push(tItem);
                }
            }
        }
    }

    if (mCurrentMapByCityResultList.length > 1)
        columns.push({ title: 'Total', data: 'total' });

    result.columns = columns;
    result.dataSet = dataSet;
    return result;

}

function loadCityListenersTable(result) {
    var table = $('#table_city_listeners').DataTable({
        "order": [[ result.columns.length - 1, "desc" ]],
        data: result.dataSet,
        columns: result.columns,
        dom: domDefault(),
        buttons: dtButtons('CityListeners')
    });

    dtAssignButtons(table);
}

function getMountsInfoByCityCode(code) {
    var data = {};
    for (var i = 0; i < mCurrentMapByCityResultList.length; i++) {
        var name = mCurrentMapByCityResultList[i].mountItem.name;
        var records = mCurrentMapByCityResultList[i].data.Records;
        for (var j = 0; j < records.length; j++) {
            var record = records[j];
            if (code == record.code) {
                data[name] = record.value;
            }
        }
    }
    return data;
}

function drawMapByCityListenersChart(data, categories) {
    Highcharts.setOptions({
        lang: {
            decimalPoint: ',',
            thousandsSep: ' '
        }
    });
    $('#chart_map_by_city_listeners').highcharts({
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Listeners by City'
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
            data: data
        }]
    });
}
