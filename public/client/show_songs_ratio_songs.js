/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// Other -> Song Ratio -> Songs

// УДОБНО ДЛЯ ЛОГИРОВАНИЯ
// var CONTEXT = add_methods_context({});


var show_songs_ratio_songs = (function () {
  "use strict";

  var TREE = {
    'main'                  : { id: 'main' },
    'datapicker'            : { id: 'main_1' },
    'check_radio'           : { id: 'main_2', style: 'style=text-align:center;margin-top:20px' },
    button_exportExcel_table: { id: 'main_3' },
  };

  var start = function() {
    getByID(TREE.main.id).innerHTML       = html_architecture();
    getByID(TREE.datapicker.id).innerHTML = html_datepicker();
    initDateSingle(build_page_songs_ratio_days); // вставляем в календарь вчерашний день и вешаем функцию на изменение даты
    build_page_songs_ratio_days();
  };

  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start : start };

// ---------------------------------------------------------------------------------------
  function build_page_songs_ratio_days () {
    var CONTEXT = add_methods_context({});

    var mountList = getSelectedMounts();
    CONTEXT.set('mountList', mountList);

    var for_check_ratio = data_check_radio(mountList);
    getByID(TREE.check_radio.id).innerHTML              = html_check_radio(for_check_ratio);
    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=text-align:center;color:#999>Loading...</p>';
    set_event_check_ratio(CONTEXT);

    request_about_songs_ratio_days(CONTEXT, for_check_ratio[0] || null);
  }


  // station_name –– "Дорожное 64 (без рекламы)"
  function request_about_songs_ratio_days (CONTEXT, station_name) {
    var current_date = getSingleDate();
    CONTEXT['current_date'] = current_date;

    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=margin-top:40px;text-align:center;color:#999>Loading...</p>';
    var radio_station = fn.search_in_array(CONTEXT.get('mountList'), function(i, hash_station) {
      return (hash_station.name === station_name) ? hash_station : false;
    });
    if (!station_name) { html_error_not_exist_station(); return; }

    CONTEXT['station_name'] = station_name;
    var params = '/?station='+radio_station.hostname+'&mount='+radio_station.mount+'&date='+current_date;

    _R('/other/api_songs_ratio_songs'+params, null, function(Xhr) {
      var answer         = JSON.parse(Xhr.responseText);
      if (isEmptyHash(answer.data) || isEmptyArray(answer.order_songs)) { html_error_not_exist_data_on_date(); return; }
      CONTEXT['data']        = answer.data;
      CONTEXT['order_songs'] = answer.order_songs;

      getByID(TREE.button_exportExcel_table.id).innerHTML = html_button_export_excel(CONTEXT) + html_table(CONTEXT);
    });
  }


  function html_architecture () {
    var html = '';
    html+='<div id='+TREE.main.id+'>';
      html+='<div id='+TREE.datapicker.id+'></div>'; // datapicker
      html+='<div id='+TREE.check_radio.id+' '+TREE.check_radio.style+'></div>'; // check_ratio
      html+='<div id='+TREE.button_exportExcel_table.id+'></div>'; // button export excel, table
    html+='</div>';
    return html;
  }


  function html_datepicker () {
    var html = '';
    html += '<div class="input-group date" data-provide="datepicker" id="dpSingle">';
      html += '<input type="text" class="form-control">';
      html += '<div class="input-group-addon">';
        html += '<span class="glyphicon glyphicon-th"></span>';
      html += '</div>';
    html += '</div>';
    return html;
  }


  // имена радио для checkbox
  // mountList –– [ { hostname: "dorognoe.hostingradio.ru", mount: "/dor_64_no"mount_id: "2", name: "Дорожное 64 (без рекламы)", station_url: "http://dorognoe.hostingradio.ru:8000/status_stream.xsl" }, ... ]
  // return ["Дорожное 64 (без рекламы)", "BlackStarRadio", ...]
  function data_check_radio (mountList) {
    return fn.map_value(mountList, function(station) {
      return station.name;
    });
  }


  // data –– ["Дорожное 64 (без рекламы)", "BlackStarRadio", ...]
  function html_check_radio (data) {
    return fn.reduce(data, function(html, i, station_name) {
      var n  = i+1;
      var id = TREE.check_radio.id+'_'+n;
      // id вешаем всегда на input, иначе при делегировании событии, при клике на label, клик будет попадать и на input
      if (i === 0) { // default: всегда включаем первую станцию
        return html += '<label class=radio-inline><input id='+id+' type=radio name=optradio checked="checked">'+station_name+'</label>';
      }
      return html += '<label class=radio-inline><input id='+id+' type=radio name=optradio>'+station_name+'</label>';
    }, '');
  }


  function set_event_check_ratio (CONTEXT) {
    var check_radio_id = TREE.check_radio.id;
    getByID(check_radio_id).onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        m = t.id.match(new RegExp('^('+check_radio_id+'_\\d+)$'));
        if (m && m[1]) {
          var input_id = m[1];
          request_about_songs_ratio_days(CONTEXT, getByID(input_id).parentNode.textContent);
        }
      }
    };
  }


 /* data ––
 { 'БОЖЬЯ КОРОВКА ГРАНИТНЫЙ КАМУШЕК':
   { value_play: 1, total_value_listeners_start_song: 6, total_value_listeners_after_15s: 6, ratio_percent: '0.00' },
   { value_play: 1, total_value_listeners_start_song: 22,total_value_listeners_after_15s: 23,ratio_percent: '4.55' },
 }
 order_songs –– [ [ 'АНЖЕЛИКА ВАРУ', 3 ], [ 'ЛЕСОПОВАЛ Я КУПЛЮ ТЕБЕ ДОМ', 2 ], [ 'НИКОЛАЙ БАСКОВ ЛЮБОВЬ - НЕ СЛОВА', 2 ], ]
 */
  function html_table (CONTEXT) {
    var html = '';
    var css  = '';
    var songs = CONTEXT.get('data'), order_songs = CONTEXT.get('order_songs');
    html += '<table id=table_data class="table table-striped table-bordered">';
      html += '<tr>';
        html += '<th colspan="4" style=background:#DDD;text-align:center>Songs Ratio</th>';
      html += '<tr>';
        html += '<th>Meta</th>';
        html += '<th>Number of playing</th>';
        html += '<th>Total listeners</th>';
        html += '<th>Rate of growth</th>';
      fn.foreach_value(order_songs, function(top_list) {
      var song_name  = top_list[0],
          value_play = top_list[1],
          song       = songs[song_name];
      html += '<tr>';
        html += '<td>'+song_name+'</td>';
        html += '<td>'+value_play+'</td>';
        html += '<td>'+song.total_value_listeners_start_song+'</td>';
        html += html_ratio(song.ratio_percent);
      });
    html+= '</table>';
    return html;
  }


  function html_button_export_excel (CONTEXT) {
    var html = '';
    var station_name  = CONTEXT.get('station_name').replace(/\s+/g, '_').replace(/\"\'/g, '');
    var filename = 'table_songs_ratio_days_'+station_name+'_'+CONTEXT.get('current_date')+'.xls';
    html += '<a style="margin:20px auto" class="btn btn-default buttons-excel buttons-html5" download='+filename+' href="#" onclick="return ExcellentExport.excel(this, \'table_data\', \''+station_name+'\');">Export to Excel</a>';
    return html;
  }


  // ratio –– число
  function html_ratio (ratio) {
    ratio = Number(ratio);
    if (ratio > 0) {
      return '<td style=background:#DFF0D8>'+ratio+'%<i class="glyphicon glyphicon-arrow-up"></i></td>';
    } else if (ratio < 0) {
      return '<td style=background:#F2DEDE>'+ratio+'%<i class="glyphicon glyphicon-arrow-down"></i></td>';
    } else if (ratio === 0 || ratio === '–') {
      return '<td>'+ratio+'</td>';
    }
  }


  // если нет данных от СЕРВЕРА рисуем сообщение
  function html_error_not_exist_data_on_date () {
    var text = 'Sorry, the data for a selected period of time absent. Try to select another date.';
    var html = '';
    html += '<span style="font-size:200%;color:#EC4B4B">'+text+'<span>';
    getByID(TREE.button_exportExcel_table.id).innerHTML = html;
  }


  // если нет такой радио станции
  function html_error_not_exist_station () {
    var text = 'Sorry, this radio station is missing.';
    var html = '';
    html += '<span style="font-size:200%;color:#EC4B4B">'+text+'<span>';
    getByID(TREE.button_exportExcel_table.id).innerHTML = html;
  }

}());


