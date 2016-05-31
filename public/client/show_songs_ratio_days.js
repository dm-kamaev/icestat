/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// Other -> Song Ratio -> Days

// TODO: button_exportExcel_table разделить на две части или рендеринг таблицы и кнопки вынести в view
// TODO: navigation_by_dates      html вынести во view

var show_songs_ratio_days = (function () {
  "use strict";

  var TREE = {
    main                    : { id: 'main', },
    datapicker              : { id: 'main_1' },
    check_radio             : { id: 'main_2', style: 'text-align:center;margin-top:20px' },
    button_get_data         : { id: 'main_3', style: 'margin-top:50px;text-align:center'},
    navigation_by_dates     : { id: 'main_4', style: 'text-align:center', events: navigation_by_dates},
    button_exportExcel_table: { id: 'main_5'},
  };
  // selected_station_name –– "radiovera-64mp3",
  // selected_date –– '2016-05-04', max_days –– макс. диапазон между датами,
  // memo –– объект в котором будет запоминать данные для радио за диапазон, и не лезть каждый раз на сервер
  var CONTEXT = add_methods_context({
    selected_station_name: '', selected_date: '', max_days: 200, memo: {},
    first_call: 0,
  });

  var start = function() {
    getByID(TREE.main.id).innerHTML            = html_container();
    getByID(TREE.datapicker.id).innerHTML      = work_daterangepicker.get_html_daterange();

    var list_radio_name = api_radio.get_list_radio_name(getSelectedMounts());
    CONTEXT.selected_station_name = list_radio_name[0];
    getByID(TREE.check_radio.id).innerHTML = html_check_radio(list_radio_name);

    getByID(TREE.button_get_data.id).innerHTML = html_buttons.get_data();
    getByID(TREE.button_get_data.id).onclick   = build_page_songs_ratio_days;
    set_event_check_ratio_before_click_button();

    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    work_daterangepicker.changed_datepicker(build_page_songs_ratio_days);
  };

  // ЭКСПОРТИРУЕМ СТАРТОВУЮ ФУНКЦИЮ
  return { start : start };

// ---------------------------------------------------------------------------------------
  function build_page_songs_ratio_days () {
    var mountList = getSelectedMounts(), range = getDateRange();
    CONTEXT['mountList']  = mountList;
    CONTEXT['start_date'] = range[0]; CONTEXT['end_date'] = range[1];
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат

    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=text-align:center;color:#999>Processing...</p>';
    set_event_check_ratio_after_click_button();
    console.log('build_page_songs_ratio_days')
    request_about_songs_ratio_days();
  }


  // station_name –– "Дорожное 64 (без рекламы)"
  function request_about_songs_ratio_days () {
    console.log('request_about_songs_ratio_days')
    CONTEXT['list_dates'] = time.get_range_date(CONTEXT.get('start_date'), CONTEXT.get('end_date'), CONTEXT.max_days);
    getByID(TREE.button_get_data.id).innerHTML = '';

    var radio = api_radio.search_radio_by_name(CONTEXT.get('mountList'), CONTEXT.selected_station_name);
    if (!radio) { html_error_not_exist_station(TREE.button_exportExcel_table.id); return; }

    getByID(TREE.button_exportExcel_table.id).innerHTML = '<p style=margin-top:50px;text-align:center;color:#999>Processing...</p>';

    var key = radio.hostname+radio.mount+CONTEXT.get('start_date')+CONTEXT.get('end_date');
    // не лезем на сервер, если такие данные уже были
    if (CONTEXT.memo[key]) {
      console.log('MEMO')
      CONTEXT['selected_radio']  = radio;
      CONTEXT['radio_listDates'] = CONTEXT.memo[key];
      CONTEXT.selected_date      = CONTEXT.get('start_date');

      getByID(TREE.navigation_by_dates.id).innerHTML = html_navigataion_by_dates(CONTEXT.get('list_dates'), CONTEXT.selected_date);
      TREE.navigation_by_dates.events();

      getByID(TREE.button_exportExcel_table.id).innerHTML =
        html_buttons.export_excel('table_songs_ratio_days_', radio.hostname, CONTEXT.selected_date) +
        html_table();
    } else {
      var db_mount = JSON.stringify([{ db:radio.hostname, stream: radio.mount }]);
      console.log('AJAX', db_mount, CONTEXT.get('start_date'), CONTEXT.get('end_date'));
      var params = '/?db_mount='+db_mount+'&start_date='+CONTEXT.get('start_date')+'&end_date='+CONTEXT.get('end_date');
      _R('/other/api_songs_ratio_days'+params, null, function(Xhr) {
        var answer = JSON.parse(Xhr.responseText);
        if (isEmptyHash(answer)) { html_error_not_exist_data_on_date(TREE.button_exportExcel_table.id); return; }
        CONTEXT['radio_listDates'] = answer;
        CONTEXT.memo[key]          = answer;
        CONTEXT['selected_radio']  = radio;
        CONTEXT.selected_date      = CONTEXT.get('start_date');

        getByID(TREE.navigation_by_dates.id).innerHTML = html_navigataion_by_dates(CONTEXT.get('list_dates'), CONTEXT.selected_date);
        TREE.navigation_by_dates.events();

        getByID(TREE.button_exportExcel_table.id).innerHTML =
          html_buttons.export_excel('table_songs_ratio_days_', radio.hostname, CONTEXT.selected_date) +
          html_table();
      });
    }

  }


  function html_container () {
    var html = '';
    html+='<div>';
      html+='<div id='+TREE.datapicker.id+'></div>';
      html+='<div id='+TREE.check_radio.id+' style='+TREE.check_radio.style+'></div>';
      html+='<div id='+TREE.button_get_data.id+' style='+TREE.button_get_data.style+'></div>';
      html+='<div id='+TREE.navigation_by_dates.id+' style='+TREE.navigation_by_dates.style+'></div>';
      html+='<div id='+TREE.button_exportExcel_table.id+'></div>';
    html+='</div>';
    return html;
  }


  // TODO: Сделать проще выделение первого радио
  // default: всегда включаем первую станцию
  // data –– ["Дорожное 64 (без рекламы)", "BlackStarRadio", ...]
  function html_check_radio (data) {
    return fn.reduce(data, function(html, i, station_name) {
      var n = i+1;
      // id вешаем всегда на input, иначе при делегировании событии,
      // при клике на label, клик будет попадать и на input
      if (CONTEXT.selected_station_name === station_name) { return html += '<label class=radio-inline><input id='+TREE.check_radio.id+'_'+n+' type=radio name=optradio checked=checked>'+station_name+'</label>'; }
      return html += '<label class=radio-inline><input id='+TREE.check_radio.id+'_'+n+' type=radio name=optradio>'+station_name+'</label>';
    }, '');
  }


  // кнопки '2016-05-04 -> '
  // list_dates –– ["2016-05-18", "2016-05-20"]
  // selected_date –– "2016-05-18"
  function html_navigataion_by_dates (list_dates, selected_date) {
    var html = '', id = TREE.navigation_by_dates.id;
    for (var i = 0, l = list_dates.length; i < l; i++) {
      var date = list_dates[i];
      if (selected_date === date) {
        var next_date = list_dates[i+1], prev_date = list_dates[i-1];
        if (next_date && prev_date) {
          html += '<button id='+id+'_1 type=button style=margin-right:5px; class="btn btn-default">';
            html += '&larr; '+prev_date;
          html +='</button>';
          html += '<button id='+id+'_2 type=button style=margin-left:5px; class="btn btn-default">';
            html += next_date+' &rarr;';
          html += '</button>';
        } else if (next_date) {
          html += '<button id='+id+'_2 type=button style=margin-left:5px; class="btn btn-default">';
            html += next_date+' &rarr;';
          html += '</button>';
        } else if (prev_date) {
          html += '<button id='+id+'_1 type=button style=margin-right:5px; class="btn btn-default">';
            html += '&larr; '+prev_date;
          html +='</button>';
        }
      }
    }
    return html;
  }


  // При клике на кнопки '2016-05-04 -> ' перерисовываем таблицу с данными с сервера за этот день
  function navigation_by_dates () {
    getByID(TREE.navigation_by_dates.id).onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        var reg = new RegExp('^('+TREE.navigation_by_dates.id+'_\\d+)$');
        m = t.id.match(reg);
        if (m && m[1]) {
          var button_id = m[1];
          CONTEXT.selected_date = getByID(button_id).textContent.match(/(\d{4}-\d{2}-\d{2})/)[1];
          var radio = api_radio.search_radio_by_name(CONTEXT.get('mountList'), CONTEXT.selected_station_name);
          console.log(CONTEXT.selected_date, radio);
          CONTEXT['selected_radio'] = radio;
          getByID(TREE.navigation_by_dates.id).innerHTML = html_navigataion_by_dates(CONTEXT.get('list_dates'), CONTEXT.selected_date);
          getByID(TREE.button_exportExcel_table.id).innerHTML =
            html_buttons.export_excel('table_songs_ratio_days_', radio.hostname, CONTEXT.selected_date) +
            html_table();
        }
      }
    };
  }


  // До нажатия кнопки 'Get data', при нажати на checkbox radio меняем выбранное радио
  function set_event_check_ratio_before_click_button () {
    getByID(TREE.check_radio.id).onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        var reg = new RegExp('^('+TREE.check_radio.id+'_\\d+)$');
        m = t.id.match(reg);
        if (m && m[1]) {
          var input_id = m[1];
          CONTEXT.selected_station_name = getByID(input_id).parentNode.textContent;
          console.log(CONTEXT.selected_station_name);
        }
      }
    };
  }


  // После надатия кнопки 'Get data', сразу делаем запрос к серверу
  function set_event_check_ratio_after_click_button () {
    getByID(TREE.check_radio.id).onclick = function(e) {
      var t = e && e.target || e.srcElement, m;
      while(t && !t.id){t=t.parentNode;}
      if (t.id) {
        var reg = new RegExp('^('+TREE.check_radio.id+'_\\d+)$');
        m = t.id.match(reg);
        if (m && m[1]) {
          var input_id = m[1];
          CONTEXT.selected_station_name = getByID(input_id).parentNode.textContent;
          console.log('set_event_check_ratio_after_click_button')
          request_about_songs_ratio_days();
        }
      }
    };
  }


  // given_date –– { '00': [ { date: Wed May 18 2016 00:03:09 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO', value_listeners_start_song: 690, value_listeners_after_15s: 695, ratio: 5 }, { date: Wed May 18 2016 00:03:17 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO',  value_listeners_start_song: 694, value_listeners_after_15s: 693, ratio: -1 },
  //                 '01': [ { date: Wed May 18 2016 00:03:09 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO', value_listeners_start_song: 690, value_listeners_after_15s: 695, ratio: 5 }, { date: Wed May 18 2016 00:03:17 GMT+0300 (MSK), author: 'WILLY WILLIAM', song_name: 'EGO',  value_listeners_start_song: 694, value_listeners_after_15s: 693, ratio: -1 },
  //               }
  // end_result ––  { 'dorognoe.hostingradio.ru::::/dor_64_no::::2016-05-16': given_date, 'ep256.hostingradio.ru::::/europaplus256.mp3::::2016-05-16',: given_date }
  function html_table () {
    var html = '';
    var radio_listDates = CONTEXT.get('radio_listDates');
    var radio = CONTEXT.get('selected_radio'), radio_name = radio.hostname, radio_stream = radio.mount;
    html += '<table id=table_data class="table table-striped table-bordered">';
      html += '<tr>';
        html += '<th colspan=5 style=background:#DDD;text-align:center>Songs Ratio</th>';
      html += '<tr>';
        html += '<th>Date</th>';
        html += '<th>Author</th>';
        html += '<th>Song name</th>';
        html += '<th>Count</th>';
        html += '<th>Ratio</th>';
      var by_date = radio_listDates[radio_name+'::::'+radio_stream+'::::'+CONTEXT.selected_date];
      if (by_date) {
      fn.foreach_value(time.get_list_hours('00', '24'), function(hour) {
      var songs = by_date[hour];
      if (!songs) { return; } // пропускаем, если нет данных по конкретном часу
      html += '<tr>';
        html += '<td colspan=5 style=background:#EEE;text-align:center>'+CONTEXT.selected_date+', Hour '+hour+'</td>';
      fn.foreach_value(songs, function(song) {
      var date = time.format('YYYY-MM-DD hh:mm:ss', time.get(song.date));
      html += '<tr>';
        html += '<td>'+date+'</td>';
        html += '<td>'+song.author+'</td>';
        html += '<td>'+song.song_name+'</td>';
        html += '<td>'+song.value_listeners_start_song+'</td>';
        html += html_ratio(song.ratio);
      });
      });
      }
    html+= '</table>';
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


  // если нет данных от сервера рисуем сообщение
  function html_error_not_exist_data_on_date (id) {
    var text = 'Sorry, the data for a selected period of time absent. Try to select another date.';
    var html = '';
    html += '<span style=font-size:200%;color:#EC4B4B>'+text+'</span>';
    getByID(id).innerHTML = html;
  }


  // если нет такой радио станции
  // id –– string
  function html_error_not_exist_station (id) {
    var text = 'Sorry, this radio station is missing.';
    var html = '';
    html += '<span style=font-size:200%;color:#EC4B4B>'+text+'</span>';
    getByID(id).innerHTML = html;
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


