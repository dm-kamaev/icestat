#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */

"use strict";

// МОДУЛЬ РАБОТЫ СО ВРЕМЕНЕМ


// получить объект с элементами –– свойства объект Date
// ны вход, ms, строка в нужном формате
// console.log(get());
function get (data) {
  var now = (data) ? new Date(data) : new Date();

  var
    sec   = now.getSeconds(),   // Секунды
    min   = now.getMinutes(),   // Минуты
    hour  = now.getHours(),     // Часы
    day   = now.getDate(),      // День
    month = now.getMonth() + 1, // Месяц
    year  = now.getFullYear(),  // Год

    double_sec   = add_prefix_zero(now.getSeconds()),   // Секунды c префиксным 0
    double_min   = add_prefix_zero(now.getMinutes()),   // Минуты c префиксным  0
    double_hour  = add_prefix_zero(now.getHours()),     // Часы c префиксным    0
    double_day   = add_prefix_zero(now.getDate()),      // День c префиксным    0
    double_month = add_prefix_zero(now.getMonth() + 1), // Месяц c префиксным   0

    in_ms = now.getTime(),         // время в ms
    in_s  = now.getTime() / 1000;  // время в s

  return {
    sec  : sec,
    min  : min,
    hour : hour,
    day  : day,
    month: month,
    year : year,

    double_sec  : double_sec,
    double_min  : double_min,
    double_hour : double_hour,
    double_day  : double_day,
    double_month: double_month,

    in_ms: in_ms,
    in_s : in_s
  };
}
exports.get = get;


// sec, min, hour, day, month,
function add_prefix_zero (el) {
  el = el.toString();
  if (el && el < 10)  {el = '0' + el;}
  return el;
}
exports.add_prefix_zero = add_prefix_zero;


// number_month –– string
function get_month_name (number_month) {
  number_month = parseInt(number_month, 10);
  var month_name = {
    1  : 'января',
    2  : 'февраля',
    3  : 'марта',
    4  : 'апреля',
    5  : 'мая',
    6  : 'июня',
    7  : 'июля',
    8  : 'августа',
    9  : 'сентября',
    10 : 'октября',
    11 : 'ноября',
    12 : 'декабря',
};
  return month_name[number_month];
}
exports.get_month_name = get_month_name;


// data –– ms, строка в нужном формате, объект функции get
// console.log(format('YYYY:MM:DD'));
// console.log(
//   Number(format('YYYYMMDD'))
// );
// console.log(format('Дата: YYYY:MM:DD; Время: hh:mm:ss', new Date()));
function format (str, data) {
  var time = (typeof data === 'object') ? data : get(data || null);
  return str.replace(/YYYY/g, time.year)
            .replace(/MM/g, add_prefix_zero(time.month))
            .replace(/DD/g, add_prefix_zero(time.day))

            .replace(/hh/g, add_prefix_zero(time.hour))
            .replace(/mm/g, add_prefix_zero(time.min))
            .replace(/ss/g, add_prefix_zero(time.sec));
}
exports.format = format;


// console.log(get_next_day('2016-03-12'));
// console.log(get_next_day());
function get_next_day (day) {
  day = (day) ? day : format('YYYY-MM-DD', new Date());
  // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
  // (+36) || (-12) часов - сдвигаем на середину дня
  // защищаемся от "летнего/зимнего" времени
  var shift_ms = (36 * 60 * 60 * 1000);
  var curr_ms = new Date(day + ' 00:00:00').getTime();
  return new Date(curr_ms + shift_ms);
}
exports.get_next_day = get_next_day;


// console.log(get_prev_day('2016-03-12'));
// console.log(get_prev_day());
function get_prev_day(day) {
  day = (day) ? day : format('YYYY-MM-DD', new Date());
  // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
  // (+36) || (-12) часов - сдвигаем на середину дня
  // защищаемся от "летнего/зимнего" времени
  var shift_ms = (-12 * 60 * 60 * 1000);
  var curr_ms = new Date(day + ' 00:00:00').getTime();
  return new Date(curr_ms + shift_ms);
}
exports.get_prev_day = get_prev_day;


// console.log(extract('DDDDMMDD', 20160811));
// console.log(extract('s', 1000));
// temp –– шаблон
function extract (type, data) {
  var templates = {
    'DDDDMMDD' : function(data) { // 20160811
      var m = data.toString().match(/(\d{4})(\d{2})(\d{2})/);
      return m[1]+'-'+m[2]+'-'+m[3];
    },
    's' : function(data) { // время в секундах
      return Number(data) * 1000;
    },
  };
  return get(templates[type](data));
}
exports.extract = extract;


// console.log(get_list_hours('00', '24'));
// console.log(get_list_hours(0, 24));
// массив часов
// [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23' ]
// start, end –– могут быть строкой или числом
function get_list_hours (start, end) {
  start = Number(start);
  end   = Number(end);
  var res = [];
  for (var i = start; i < end; i++) { res[i] = add_prefix_zero(i); }
  return res;
}
exports.get_list_hours = get_list_hours;








// ------------------------------------------------ OLD ------------------------------------------------

function OLD () {
  // console.log(now_time());
  // текущее время объект, где все элементы number
  // привести к ms new Date().getTime()
  function get_time (ms) {
    var now = (ms) ? new Date(ms) : new Date(),

       sec      = now.getSeconds(),   // Секунды
       min      = now.getMinutes(),   // Минуты
       hour     = now.getHours(),     // Часы
       day      = now.getDate(),      // День
       month    = now.getMonth() + 1, // Месяц
       year     = now.getFullYear();  // Год

    // console.log(sec, min, hour, day, month, year);
    return { 'sec': sec, 'min': min, 'hour': hour, 'day': day, 'month': month, 'year': year };
  }
  exports.get_time = get_time;


  // number_month –– string
  function get_month_name (number_month) {
    number_month = parseInt(number_month, 10);
    var month_name = {
      1  : 'января',
      2  : 'февраля',
      3  : 'марта',
      4  : 'апреля',
      5  : 'мая',
      6  : 'июня',
      7  : 'июля',
      8  : 'августа',
      9  : 'сентября',
      10 : 'октября',
      11 : 'ноября',
      12 : 'декабря',
    };
    return month_name[number_month];
  }
  exports.get_month_name = get_month_name;


  // sec, min, hour, day, month,
  function add_leading_zero (el) {
    el = el.toString();
    if (el && el < 10)  {el = '0' + el;}
    return el;
  }
  exports.add_leading_zero = add_leading_zero;


  // console.log(format('YYYY:MM:DD'));
  // console.log(
  //   Number(format('YYYYMMDD'))
  // );
  // console.log(format('Дата: YYYY:MM:DD; Время: hh:mm:ss', new Date()));
  // console.log(work().format('Дата: YYYY:MM:DD; Время: hh:mm:ss'));
  function format(str, ms) {
    var time = get_time(ms || null);
    return str.replace(/YYYY/g, time.year)
              .replace(/MM/g, add_leading_zero(time.month))
              .replace(/DD/g, add_leading_zero(time.day))

              .replace(/hh/g, add_leading_zero(time.hour))
              .replace(/mm/g, add_leading_zero(time.min))
              .replace(/ss/g, add_leading_zero(time.sec));
  }
  exports.format = format;


  // console.log(get_next_day('2016-03-12'));
  // console.log(get_next_day());
  function get_next_day (day) {
    day = (day) ? day : format('YYYY-MM-DD', new Date());
    // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
    // (+36) || (-12) часов - сдвигаем на середину дня
    // защищаемся от "летнего/зимнего" времени
    var shift_ms = (36 * 60 * 60 * 1000);
    var curr_ms = new Date(day + ' 00:00:00').getTime();
    return new Date(curr_ms + shift_ms);
    // return format_day(new Date(curr_ms + shift_ms));
  }
  exports.get_next_day = get_next_day;


  // console.log(get_prev_day('2016-03-12'));
  // console.log(get_prev_day());
  function get_prev_day (day) {
    day = (day) ? day : format('YYYY-MM-DD', new Date());
    // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
    // (+36) || (-12) часов - сдвигаем на середину дня
    // защищаемся от "летнего/зимнего" времени
    var shift_ms = (-12 * 60 * 60 * 1000);
    var curr_ms = new Date(day + ' 00:00:00').getTime();
    return new Date(curr_ms + shift_ms);
  }
  exports.get_prev_day = get_prev_day;
}


// console.log(get_range_date('2016-03-07', '2016-03-10', 7));
// start_date, end_date –– формат 'YYYY-MM-DD'
// max_days –– digit, можно задавать маскисмальное число разницы между днями
// return ––  [ '2016-03-07', '2016-03-08', '2016-03-09', '2016-03-10',]
function get_range_date (start_date, end_date, max_days) {
  var res = [], current;
  res.push(start_date);

  for (var i = 0; i < max_days; i++) {
    if (start_date === end_date) { return res;}
    start_date = format('YYYY-MM-DD', get(get_next_day(start_date)));
    res.push(start_date);
  }
  return res;
}
exports.get_range_date = get_range_date;

