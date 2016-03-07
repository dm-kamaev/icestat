#!/usr/local/bin/node
"use strict";

// day = 2016-02-16
exports.next_day     = function(day) { return shift_day(day, 1); }
exports.prev_day     = function(day) { return shift_day(day, -1); }

// get_7day_ago('2016-02-16');
function get_7day_ago (day) {
  for(var i = 0; i < 7; i++) { day = shift_day(day, -1); } return day;
}
exports.get_7day_ago = get_7day_ago;


//
function shift_day (day, direction) {
  // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
  // (+36) || (-12) часов - сдвигаем на середину дня
  // защищаемся от "летнего/зимнего" времени
  var shift_ms = (direction > 0) ? (36 * 60 * 60 * 1000) : (-12 * 60 * 60 * 1000);
  var curr_ms = new Date(day + ' 00:00:00').getTime();
  return format_day(new Date(curr_ms + shift_ms));
}

// на выход ФОРМАТ: 2016-02-16 (from object Date)
function format_day (date) {
  function prefix_zero(number) {
    var s = number.toString();
    if(s.length < 2) { s='0'+s; }
    return s;
  }
  return date.getFullYear()+'-'+prefix_zero((date.getMonth()+1))+'-'+prefix_zero(date.getDate());
}
///////////////////////////////////////////

// format_for_highcharts(1455570000000);
function format_for_highcharts (date_ms) {
  var time  = get_current_time(date_ms);
  var res = '';
  res+= get_day_week(time.week_day)+', '+
        get_month_name(time.month)+' '+time.day+', '+
        time.year+', '+prefix_zero(time.hour)+':'+prefix_zero(time.min);
  // console.log(time);
  // console.log(res);
  return res;
}
exports.format_for_highcharts = format_for_highcharts;

function get_current_time(time) {
  var now      = new Date(time),
      sec      = now.getSeconds(),    // Секунды
      min      = now.getMinutes(),    // Минуты
      hour     = now.getHours(),      // Часы
      day      = now.getDate(),       // День 0-31
      week_day = now.getDay(),        // Номер дня в недели 0-6
      month    = now.getMonth() + 1,  // Месяц
      year     = now.getFullYear();   // Год
  console.log(now)
  // console.log(sec, min, hour, day, month, year);
  return {'sec' : sec, 'min' : min, 'hour' : hour, 'day' : day, week_day : week_day, 'month' : month, 'year' : year};
}
exports.get_current_time = get_current_time;


function now_time() {
  var now      = new Date(),
      sec      = now.getSeconds(),    // Секунды
      min      = now.getMinutes(),    // Минуты
      hour     = now.getHours(),      // Часы
      day      = now.getDate(),       // День 0-31
      week_day = now.getDay(),        // Номер дня в недели 0-6
      month    = now.getMonth() + 1,  // Месяц
      year     = now.getFullYear();   // Год

  // console.log(sec, min, hour, day, month, year);
  return {'sec' : sec, 'min' : min, 'hour' : hour, 'day' : day, week_day : week_day, 'month' : month, 'year' : year};
}
exports.now_time = now_time;


// number_month –– string
function get_month_name (number_month) {
  number_month = parseInt(number_month, 10);
  var month_name = {
    1  : 'Jan',    // January
    2  : 'Feb',    // February
    3  : 'Mar',    // March
    4  : 'Apr',    // April
    5  : 'May',    // May
    6  : 'June',   // June
    7  : 'July',   // July
    8  : 'August', // Aug
    9  : 'Sep',    // September
    10 : 'Oct',    // October
    11 : 'Nov',    // November
    12 : 'Dec',    // December
  };
  return month_name[number_month];
}
exports.get_month_name = get_month_name;


function get_day_week (number_day) {
  number_day = parseInt(number_day, 10);
  var day_name = {
    1 : 'Monday',
    2 : 'Tuesday',
    3 : 'Wendsday',
    4 : 'Thursday',
    5 : 'Friday',
    6 : 'Saturday',
    7 : 'Sunday',
  };
  return day_name[number_day];
}
exports.get_day_week = get_day_week;


function prefix_zero (number) {
  var s = number.toString();
  if(s.length < 2) { s='0'+s; }
  return s;
}
