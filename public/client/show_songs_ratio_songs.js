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
    'get_data'              : { id: 'main_3', style: 'style=margin-top:50px;text-align:center'},
    button_exportExcel_table: { id: 'main_4' },
  };
  // TODO: Отказаться от INFO в пользу CONTEXT
  // для глобальной области скрипта, хранить данные
  var INFO = { selected_station_name: ''}; // выбранная станция и первый запуск

  var start = function() {
    getByID(TREE.main.id).innerHTML        = html_architecture();
    getByID(TREE.datapicker.id).innerHTML  = work_daterangepicker.get_html_daterange();
    getByID(TREE.check_radio.id).innerHTML = html_check_radio(data_check_radio(getSelectedMounts()));
    getByID(TREE.get_data.id).innerHTML    = html_button_get_data();

    set_event_check_ratio_before_click_button();
    getByID(TREE.get_data.id).onclick = build_page_songs_ratio_songs;


    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    work_daterangepicker.changed_datepicker(build_page_songs_ratio_songs);
  };

  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start: start };

// ---------------------------------------------------------------------------------------
  function build_page_songs_ratio_songs () {
    var CONTEXT = add_methods_context({});

    var mountList = getSelectedMounts(), range = getDateRange();
    CONTEXT.set('mountList', mountList);
    CONTEXT.set('range_date', range);
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат

    // TODO: сделать так чтобы два раза не вызывать функцию getSelectedMounts
    getByID(TREE.check_radio.id).innerHTML = html_check_radio(data_check_radio(getSelectedMounts()));
    set_event_check_ratio_after_click_button(CONTEXT);

    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=text-align:center;color:#999>Processing...</p>';

    request_about_songs_ratio_days(CONTEXT);
  }


  // station_name ––
  function request_about_songs_ratio_days (CONTEXT) {
    if (!INFO.selected_station_name) { html_error_not_selected_radio(); return;}

    getByID(TREE.get_data.id).innerHTML   = '';
    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=text-align:center;color:#999>Processing...</p>';

    var radio_station = fn.search_in_array(CONTEXT.get('mountList'), function(i, hash_station) {
      return (hash_station.name === INFO.selected_station_name) ? hash_station : false;
    });
    CONTEXT['station_name'] = INFO.selected_station_name;
    var range_date = CONTEXT.get('range_date');
    var db_mount = [{ db:radio_station.hostname, stream:radio_station.mount }];
    var params = '/?db_mount='+JSON.stringify(db_mount)+'&start_date='+range_date[0]+'&end_date='+range_date[1];

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
      html+='<div id='+TREE.get_data.id+' '+TREE.get_data.style+'></div>'; // button get data
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
    return fn.map_value(mountList, function(station) { return station.name; });
  }


  // data –– ["Дорожное 64 (без рекламы)", "BlackStarRadio", ...]
  function html_check_radio (data) {
    return fn.reduce(data, function(html, i, station_name) {
      var n  = i+1;
      var id = TREE.check_radio.id+'_'+n;
      // id вешаем всегда на input, иначе при делегировании событии, при клике на label, клик будет попадать и на input
      if (station_name === INFO.selected_station_name) {
        return html += '<label class=radio-inline><input id='+id+' type=radio name=optradio checked="checked">'+station_name+'</label>';
      }
      return html += '<label class=radio-inline><input id='+id+' type=radio name=optradio>'+station_name+'</label>';
    }, '');
  }


  // вешаем обработчик на выбор станции
  // будет работать до тех пор пока не нажмем кнопку 'Get data'
  // только сохраняем имя станции выбранной
  function set_event_check_ratio_before_click_button () {
    var check_radio_id = TREE.check_radio.id;
    getByID(check_radio_id).onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        m = t.id.match(new RegExp('^('+check_radio_id+'_\\d+)$'));
        if (m && m[1]) {
          var input_id = m[1];
          INFO.selected_station_name = getByID(input_id).parentNode.textContent;
        }
      }
    };
  }


  // вешаем обработчик на выбор станции
  // будет работать после нажатия кнопки 'Get data'
  // делаем запрос к серверу по клику
  function set_event_check_ratio_after_click_button (CONTEXT) {
    var check_radio_id = TREE.check_radio.id;
    getByID(check_radio_id).onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        m = t.id.match(new RegExp('^('+check_radio_id+'_\\d+)$'));
        if (m && m[1]) {
          var input_id = m[1];
          INFO.selected_station_name = getByID(input_id).parentNode.textContent;
          request_about_songs_ratio_days(CONTEXT);
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
        html += '<th colspan=5 style=background:#DDD;text-align:center>Songs Ratio</th>';
      html += '<tr>';
        html += '<th>Author</th>';
        html += '<th>Song name</th>';
        html += '<th>Number of playing</th>';
        html += '<th>Total listeners</th>';
        html += '<th>Rate of growth</th>';
      fn.foreach_value(order_songs, function(top_list) {
      var authorSong_name = top_list[0],
          value_play      = top_list[1],
          song            = songs[authorSong_name],
          authorSongname  = authorSong_name.split('::::'),
          author          = authorSongname[0],
          song_name       = authorSongname[1];
      html += '<tr>';
        html += '<td>'+author+'</td>';
        html += '<td>'+song_name+'</td>';
        html += '<td>'+value_play+'</td>';
        // html += '<td>'+song.total_value_listeners_start_song+'</td>';
        html += '<td>'+song.value_listeners_start_song+'</td>';
        html += html_ratio(song.ratio_percent);
      });
    html+= '</table>';
    return html;
  }


  function html_button_export_excel (CONTEXT) {
    var html = '';
    var station_name = CONTEXT.get('station_name').replace(/\s+/g, '_').replace(/\"\'/g, '');
    var range_date   = CONTEXT.get('range_date'), view_date = range_date[0]+'_'+range_date[1];
    var filename = 'table_songs_ratio_days_'+station_name+'_'+view_date+'.xls';
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


  // если не выбрано ни одной станции при нажатии кнопки 'Get data'
  function html_error_not_selected_radio () {
    var text = 'Please, select radio.';
    var html = '';
    html += '<p style=margin-top:100px;text-align:center><span style="font-size:200%;color:#EC4B4B">'+text+'</span></p>';
    getByID(TREE.button_exportExcel_table.id).innerHTML = html;
  }

  function html_button_get_data () { return '<button type=button style="width:25%;font-size:140%;" class="btn btn-success">Get data</button>'; }

}());


