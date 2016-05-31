/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */


// РАБОТА СО СПИСКОМ РАДИО ДОСТУПНЫХ ПОЛЬЗОВАТЕЛЮ

var api_radio = (function () {
  "use strict";
  var exports = {};

  // mountList –– [ { hostname: "dorognoe.hostingradio.ru", mount: "/dor_64_no"mount_id: "2", name: "Дорожное 64 (без рекламы)", station_url: "http://dorognoe.hostingradio.ru:8000/status_stream.xsl" }, ... ]
  // return ["Дорожное 64 (без рекламы)", "BlackStarRadio", ...]
  exports.get_list_radio_name = function (mountList) {
    return fn.map_value(mountList, function(station) { return station.name; });
  };

  // mountList  –– [{ hostname: "ep256.hostingradio.ru", mount:"/europaplus256.mp3", mount_id: "235", name: "emg-europaplus-256mp3", station_url: "http://ep256.hostingradio.ru:8052/status_stream.xsl",}, ... ]
  // radio_name –– "emg-europaplus-256mp3"
  exports.search_radio_by_name = function (mountList, radio_name) {
    return fn.search_in_array(mountList, function(i, radio) {
      return (radio.name === radio_name) ? radio : false;
    });
  }

  return exports;
}());
