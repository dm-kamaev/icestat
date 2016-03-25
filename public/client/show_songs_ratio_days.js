/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// Other -> Song Ratio -> Days

// УДОБНО ДЛЯ ЛОГИРОВАНИЯ
// var CONTEXT = add_methods_context({});

// TODO: Не хранить id в верстке. Перейти на объект с id.

var show_songs_ratio_days = (function () {
  "use strict";

  var start = function() {
    getByID('main').innerHTML   = html_architecture();
    getByID('main_1').innerHTML = html_datepicker();
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
    getByID('main_2').innerHTML = html_check_radio(for_check_ratio);
    getByID('main_3').innerHTML = '<p style=text-align:center;color:#999>Loading...</p>';
    set_event_check_ratio(CONTEXT);

    request_about_songs_ratio_days(CONTEXT, for_check_ratio[0] || null);
  }


  // station_name –– "Дорожное 64 (без рекламы)"
  function request_about_songs_ratio_days (CONTEXT, station_name) {
    var current_date = getSingleDate();
    CONTEXT['current_date'] = current_date;

    getByID('main_3').innerHTML = '<p style=margin-top:40px;text-align:center;color:#999>Loading...</p>';
    var radio_station = fn.search_in_array(CONTEXT.get('mountList'), function(i, hash_station) {
      return (hash_station.name === station_name) ? hash_station : false;
    });
    if (!station_name) { html_error_not_exist_station(); return; }

    CONTEXT['station_name'] = station_name;
    var params = '/?station='+radio_station.hostname+'&mount='+radio_station.mount+'&date='+current_date;

    _R('/other/api_songs_ratio_days'+params, null, function(Xhr) {
      var answer         = JSON.parse(Xhr.responseText);
      if (isEmptyHash(answer)) { html_error_not_exist_data_on_date(); return; }
      CONTEXT['data_group_by_hours'] = answer;

      getByID('main_3').innerHTML = html_button_export_excel(CONTEXT) + html_table(CONTEXT);
    });
  }


  function html_architecture () {
    var html = '';
    html+='<div id=main>';
      html+='<div id=main_1></div>'; // datapicker
      html+='<div id=main_2 style=text-align:center;margin-top:20px></div>'; // check_ratio
      html+='<div id=main_3></div>'; // button export excel, table
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
      var n = i+1;
      // id вешаем всегда на input, иначе при делегировании событии, при клике на label, клик будет попадать и на input
      if (i === 0) { // default: всегда включаем первую станцию
        return html += '<label class=radio-inline><input id=main_2_'+n+' type=radio name=optradio checked="checked">'+station_name+'</label>';
      }
      return html += '<label class=radio-inline><input id=main_2_'+n+' type=radio name=optradio>'+station_name+'</label>';
    }, '');
  }


  function set_event_check_ratio (CONTEXT) {
    getByID('main_2').onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        m = t.id.match(/^(main_2_\d+)$/);
        if (m && m[1]) {
          var input_id = m[1];
          request_about_songs_ratio_days(CONTEXT, getByID(input_id).parentNode.textContent);
        }
      }
    };
  }


 /*{
    songs_ratio_days_00: [
      { start_song_ms: 1457470825000, after_15s_ms: 1457470840000, meta: "АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ", ratio: -1, value_listeners_after_15s: 447, value_listeners_start_song: 448},
      { start_song_ms: 1457470825000, after_15s_ms: 1457470840000, meta: "АЛЕКСАНДР СЕРОВ МУЗЫКА ВЕНЧАЛЬНАЯ", ratio: -1, value_listeners_after_15s: 447, value_listeners_start_song: 448},
    ],
    songs_ratio_days_01: [ {}, {}, ...]
  }*/
  function html_table (CONTEXT) {
    var html = '';
    var css  = '';
    var group_by_hours = CONTEXT.get('data_group_by_hours');
    html += '<table id=table_data class="table table-striped table-bordered">';
      html += '<tr>';
        html += '<th colspan="4" style=background:#DDD;text-align:center>Songs Ratio</th>';
      html += '<tr>';
        html += '<th>Date</th>';
        html += '<th>Meta</th>';
        html += '<th>Count</th>';
        html += '<th>Ratio</th>';
      fn.foreach_value(time.get_list_hours('00', '24'), function(hour) {
      var key = 'songs_ratio_days_'+hour;
      if (!group_by_hours[key]) { return; } // пропускаем, если нет данных по конкретном часу
      html += '<tr>';
        html += '<td colspan="4" style=background:#EEE;text-align:center>'+CONTEXT.get('current_date')+', Hour '+hour+'</td>';
      fn.foreach_value(group_by_hours[key], function(song) {
      var date = time.format('YYYY-MM-DD hh:mm:ss', time.get(song.start_song_ms));
      html += '<tr>';
        html += '<td>'+date+'</td>';
        html += '<td>'+song.meta+'</td>';
        html += '<td>'+song.value_listeners_start_song+'</td>';
        html += html_ratio(song.ratio);
      });
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
    if (ratio > 0) {
      return '<td style=background:#DFF0D8>'+ratio+'<i class="glyphicon glyphicon-arrow-up"></i></td>';
    } else if (ratio < 0) {
      return '<td style=background:#F2DEDE>'+ratio+'<i class="glyphicon glyphicon-arrow-down"></i></td>';
    } else if (ratio === 0 || ratio === '–') {
      return '<td>'+ratio+'</td>';
    }
  }


  // если нет данных от СЕРВЕРА рисуем сообщение
  function html_error_not_exist_data_on_date () {
    var text = 'Sorry, the data for a selected period of time absent. Try to select another date.';
    var html = '';
    html += '<span style="font-size:200%;color:#EC4B4B">'+text+'<span>';
    getByID('main_3').innerHTML = html;
  }


  // если нет такой радио станции
  function html_error_not_exist_station () {
    var text = 'Sorry, this radio station is missing.';
    var html = '';
    html += '<span style="font-size:200%;color:#EC4B4B">'+text+'<span>';
    getByID('main_3').innerHTML = html;
  }


  // EXAMPLE
  // function html_table () {
  //   var html = '';
  //   var css  = '';
  //   html+= '<table id=table_data>';
  //     html+= '<tr>';
  //       html+= '<th>Date</th>';
  //       html+= '<th>Meta</th>';
  //       html+= '<th>Count</th>';
  //       html+= '<th>Ratio</th>';
  //     html+= '<tr>';
  //       html+= '<td colspan="4" style=background:#eee;text-align:center>01:00</td>';
  //     html+= '<tr>';
  //       html+= '<td>2016 08 04</td>';
  //       html+= '<td>Алегрова</td>';
  //       html+= '<td>405</td>';
  //       html+= '<td>-10</td>';
  //   html+= '</table>';
  //   return html;
  // }

}());


