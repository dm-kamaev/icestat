#!/usr/local/bin/node
"use strict";

// day = 2016-02-16
exports.next_day     = function(day) { return shift_day(day, 1); }
exports.prev_day     = function(day) { return shift_day(day, -1); }
exports.get_7day_ago = function(day) { for(var i = 0; i < 7; i++) { day = shift_day(day, -1); } return day; }

//
function shift_day(day, direction) {
  var shift_ms=(direction>0) ? (36*60*60*1000) : (-12*60*60*1000);  // (+36)||(-12) часов - сдвигаем на середину дня // защита от "летнего/зимнего" времени
  var curr_ms = new Date(day + ' 00:00:00').getTime();
  return format_day(new Date(curr_ms + shift_ms));
}

//
function format_day(date) { // 2016-02-16 from object Date
  function prefix_zero(number) {
    var s = number.toString();
    if(s.length < 2) { s='0'+s; }
    return s;
  }
  return date.getFullYear()+'-'+prefix_zero((date.getMonth()+1))+'-'+prefix_zero(date.getDate());
}
///////////////////////////////////////////



