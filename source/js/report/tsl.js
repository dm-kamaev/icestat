function initTSLReportPage() {
    // initDiffDatepicker(sendTSLReportRequest, 7); // week
    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    // TODO: костыль в будущем надо перейти на TREE по DOM
    getByID('main').insertAdjacentHTML('beforeEnd', '<div id="main_1" style="margin-top:20px;text-align:center"><button type="button" style="width:25%;font-size:140%;" class="btn btn-success">Get data</button></div>');
    getByID('main_1').onclick = sendTSLReportRequest;
}

function sendTSLReportRequest() {
    getByID('main_1').innerHTML = ''; // убираем кнопку
    // вешаем функцию на изменение даты
    work_daterangepicker.changed_datepicker(sendTSLReportRequest);
    var range = getDateRange();
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат
    var mountList = getSelectedMounts();

    $('#table_report_tsl').fadeOut(1000);

    $.post('/api/report/tsl',
           {
               startDate: range[0],
               endDate: range[1],
               mounts: JSON.stringify(mountList)
           },
           function (data, textStatus, jqXHR) {
                var result = prepareFieldsForTSLReportTable(data);
                clearTableIfExist('#table_report_tsl');
                loadTSLReportTable(result);
           }
          );
}

function prepareFieldsForTSLReportTable(data) {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({
        title: 'Date',
        data: 'date',
    });

    function toMinutes(seconds) {
        return Math.round(seconds / 60);
    }

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var name = 'total_'+ item.mountItem.mount_id;
        columns.push({ title: item.mountItem.name, data: name, className: 'sum' });
        if (dataSet.length === 0) {
            for (var j = 0; j < item.data.Records.length; j++) {
                var record = item.data.Records[j];
                var tableItem = {};
                tableItem.date = record.date;
                tableItem[name] = toMinutes(record.totalSeconds);
                tableItem.total = toMinutes(record.totalSeconds);
                dataSet.push(tableItem);
            }
        } else {
            for (var k = 0; k < item.data.Records.length; k++) {
                var column_record = item.data.Records[k];
                dataSet[k][name] = toMinutes(column_record.totalSeconds);
                dataSet[k].total += toMinutes(column_record.totalSeconds);
            }
        }
    }

    result.isMultipleColumns = data.length > 1;
    if (result.isMultipleColumns)
        columns.push({ title: 'Total', data: 'total', className: 'sum' });

    result.columns = columns;
    result.dataSet = dataSet;
    return result;
}

function loadTSLReportTable(result) {
    var tdSumColumns = "<td class='success'></td>";
    if (result.isMultipleColumns) {
        for (var i = 1; i < result.columns.length - 1; i++)
            tdSumColumns += "<td class='success'></td>";
    }

    $('#table_report_tsl').append("<tfoot><tr><td><b>Total</b></td>" + tdSumColumns + "</tr></tfoot>");

    var table = $('#table_report_tsl').DataTable( {
        pageLength: -1,
        data: result.dataSet,
        columns: result.columns,
        lengthMenu: [[7, 14, 28, -1], [7, 14, 28, "All"]],
        dom: domDefault(),
        buttons: dtButtons('TimeSpentListening')
    } );

    table.columns('.sum').every(function () {
        var sum = this
            .data()
            .reduce(function (a,b) {
                return a + b;
            });
        $(this.footer()).html(sum);
    });

    dtAssignButtons(table);
    $('#table_report_tsl').fadeIn(1000);
}
