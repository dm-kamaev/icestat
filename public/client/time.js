/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// МОДУЛЬ ПОЛУЧЕНИЯ ОБЪЕКТА с ДАННЫМИ О ВРЕМЕНИ

var time = (function () {
  "use strict";
  var exports = {};

  // sec, min, hour, day, month,
  exports.add_prefix_zero = function  (el) {
    el = el.toString();
    if (el && el < 10)  {el = '0' + el;}
    return el;
  };


  // получить объект с элементами –– свойства объект Date
  // ны вход, ms, строка в нужном формате
  exports.get = function (data) {
    var now = (data) ? new Date(data) : new Date();

      var
        sec   = now.getSeconds(),   // Секунды
        min   = now.getMinutes(),   // Минуты
        hour  = now.getHours(),     // Часы
        day   = now.getDate(),      // День
        month = now.getMonth() + 1, // Месяц
        year  = now.getFullYear(),  // Год

        double_sec   = exports.add_prefix_zero(now.getSeconds()),   // Секунды c префиксным 0
        double_min   = exports.add_prefix_zero(now.getMinutes()),   // Минуты c префиксным  0
        double_hour  = exports.add_prefix_zero(now.getHours()),     // Часы c префиксным    0
        double_day   = exports.add_prefix_zero(now.getDate()),      // День c префиксным    0
        double_month = exports.add_prefix_zero(now.getMonth() + 1), // Месяц c префиксным   0

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
  };
  // console.log(exports.get());


  // number_month –– string
  exports.get_month_name = function get_month_name (number_month) {
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
  };


  // data –– ms, строка в нужном формате, объект функции get
  exports.format = function format (str, data) {
    var time = (typeof data === 'object') ? data : get(data || null);
    return str.replace(/YYYY/g, time.year)
              .replace(/MM/g, exports.add_prefix_zero(time.month))
              .replace(/DD/g, exports.add_prefix_zero(time.day))

              .replace(/hh/g, exports.add_prefix_zero(time.hour))
              .replace(/mm/g, exports.add_prefix_zero(time.min))
              .replace(/ss/g, exports.add_prefix_zero(time.sec));
  };
  // console.log(exports.format('YYYY:MM:DD'));
  // console.log(
  //   Number(exports.format('YYYYMMDD'))
  // );
  // console.log(exports.format('Дата: YYYY:MM:DD; Время: hh:mm:ss', new Date()));


  exports.get_next_day = function (day) {
    day = (day) ? day.replace(/-/g, ' ') : format('YYYY-MM-DD', new Date());
    // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
    // (+36) || (-12) часов - сдвигаем на середину дня
    // защищаемся от "летнего/зимнего" времени
    var shift_ms = (36 * 60 * 60 * 1000);
    var curr_ms = new Date(day + ' 00:00:00').getTime();
    return new Date(curr_ms + shift_ms);
  };
  // console.log(exports.get_next_day('2016-03-12'));
  // console.log(exports.get_next_day());


  exports.get_prev_day = function (day) {
    day = (day) ? day : format('YYYY-MM-DD', new Date());
    // 1 –– сдвиг в ms на следующий день, -1 –– сдвиг в ms на предыдущий день
    // (+36) || (-12) часов - сдвигаем на середину дня
    // защищаемся от "летнего/зимнего" времени
    var shift_ms = (-12 * 60 * 60 * 1000);
    var curr_ms = new Date(day + ' 00:00:00').getTime();
    return new Date(curr_ms + shift_ms);
  };
  // console.log(exports.get_prev_day('2016-03-12'));
  // console.log(exports.get_prev_day());


  // console.log(get_list_hours('00', '24'));
  // console.log(get_list_hours(0, 24));
  // массив часов
  // [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23' ]
  // start, end –– могут быть строкой или числом
  exports.get_list_hours = function (start, end) {
    start = Number(start);
    end   = Number(end);
    var res = [];
    for (var i = start; i <= end; i++) { res[i] = exports.add_prefix_zero(i); }
    return res;
  };


  // console.log(get_range_date('2016-03-07', '2016-03-10', 7));
  // start_date, end_date –– формат 'YYYY-MM-DD'
  // max_days –– digit, можно задавать маскисмальное число разницы между днями
  // return ––  [ '2016-03-07', '2016-03-08', '2016-03-09', '2016-03-10',]
  exports.get_range_date = function (start_date, end_date, max_days) {
    var res = [], current;
    res.push(start_date);

    for (var i = 0; i < max_days; i++) {
      if (start_date === end_date) { return res;}
      start_date = exports.format('YYYY-MM-DD', exports.get(exports.get_next_day(start_date)));
      res.push(start_date);
    }
    return res;
  };

  /* экспортируем методы */
  return exports;
}());






