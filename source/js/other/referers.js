function requestOtherReferersChartData() {
    initDatepicker(sendOtherReferersRequest);
    sendOtherReferersRequest();
}

function sendOtherReferersRequest() {
    setHighchartUseUTC(true);
    drawOtherReferersChart();

    $('#table_other_referers').fadeOut(1000);

    var chart = $('#chart_other_referers').highcharts();
    chart.showLoading();

    var range = getDateRange();
    $.post('/api/other/referers',
           {
               startDate: range[0],
               endDate: range[1],
               mounts: JSON.stringify(getSelectedMounts())
           },
           function (result, textStatus, jqXHR) {
               var data = [];
               for (var i = 0; i < result.length; i++) {
                   var records = result[i].data.Records;
                   for (var j = 0; j < records.length; j++) {
                       var resultItem = records[j];
                       var domain = (resultItem.domain) ?
                           resultItem.domain : "Players, mobile, etc";

                        if (data[domain]) {
                            data[domain] += resultItem.count;
                        } else {
                            data[domain] = resultItem.count;
                        }
                   }
               }

               var items = [];
               for (var key in data) {
                   var item = [];
                   item.push(key);
                   item.push(data[key]);
                   items.push(item);
               }

               chart.addSeries({
                   type: 'pie',
                   name: 'Referers',
                   data: items
               });

               chart.redraw();
               chart.hideLoading();
               drawOtherReferersTable(result, data);
           }
          );
}

function drawOtherReferersTable(result, totalData) {
    var data = prepareFieldsForOtherReferersTable(result, totalData);
    clearTableIfExist('#table_other_referers');
    loadOtherReferersTable(data);
    $('#table_other_referers').fadeIn(1000);
}

function prepareFieldsForOtherReferersTable(data, totalData) {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({ title: 'Domain', data: 'domain' });

    for (var p = 0; p < data.length; p++) {
        var item = data[p].mountItem;
        var name = 'total_' + item.mount_id;
        columns.push({ title: item.name, data: name, defaultContent: ''});

        var records = data[p].data.Records;
        if (dataSet.length === 0) {
            for (var j = 0; j < records.length; j++) {
                var record = records[j];
                var tableItem = {};
                tableItem.domain = record.domain ? record.domain : "Players, mobile, etc";
                tableItem[name] = record.count;
                tableItem.total = record.count;
                dataSet.push(tableItem);
            }
        } else {
            for (var k = 0; k < records.length; k++) {
                var column_record = records[k];

                var found = false;
                for (var m = 0; m < dataSet.length; m++) {
                    var domain = column_record.domain ? column_record.domain : "Players, mobile, etc";
                    if (dataSet[m].domain == domain) {
                        dataSet[m][name] = column_record.count;
                        dataSet[m].total += column_record.count;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    var tItem = {};
                    tItem.domain = column_record.domain ? column_record.domain : "Players, mobile, etc";
                    tItem[name] = column_record.count;
                    tItem.total = column_record.count;
                    dataSet.push(tItem);
                }
            }
        }
    }

    if (data.length > 1)
        columns.push({ title: 'Total', data: 'total' });

    result.columns = columns;
    result.dataSet = dataSet;
    return result;
}

function loadOtherReferersTable(result) {
    var table = $('#table_other_referers').DataTable( {
        "order": [[ result.columns.length - 1, "desc" ]],
        data: result.dataSet,
        columns: result.columns,
        dom: domDefault(),
        buttons: dtButtons('Referers')
    } );

    dtAssignButtons(table);
}

function drawOtherReferersChart() {
    $('#chart_other_referers').highcharts({
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: null
        },
        credits: {
            text: '',
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b> {point.percentage:.3f}%'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        }
    });
}
