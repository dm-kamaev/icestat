/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// КНОПКИ

var html_buttons = (function () {
  "use strict";
  var exports = {};

  // Кнопка Экспорта данных в Excel
  // prefix –– "table_songs_ratio_days_"
  // list_radio_name –– "ep256.hostingradio.ru__ep123.hostingradio.ru"
  // dates –– "2016-05-18_2016-05-18"
  exports.export_excel = function (prefix, list_radio_name, dates) {
    list_radio_name = list_radio_name.replace(/\s+/g, '_').replace(/\"\'/g, '');
    var filename = prefix+list_radio_name+'_'+dates+'.xls';
    return '<a style="margin:20px auto" class="btn btn-default buttons-excel buttons-html5" download='+filename+' href=# onclick="return ExcellentExport.excel(this, \'table_data\', \''+list_radio_name+'\');">Export to Excel</a>';
  };

  // Кнопка 'Get data'
  exports.get_data = function () {
    return '<button type=button style=width:25%;font-size:140%; class="btn btn-success">Get data</button>';
  };
;

  return exports;
}());


