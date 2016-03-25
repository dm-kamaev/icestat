#!/usr/local/bin/node

/*jshint sub: true*/
/*jshint loopfunc: true */
/*jshint newcap: false */
/*jshint multistr: true */
/*jshint expr: true */
/*jshint esnext: true */

"use strict";

// WATCHERS ДЛЯ РАЗЛИЧНЫХ ПРОЦЕССОВ

var CONF  = require('/icestat/config.js').settings();
var fs    = require('fs');
var email = require(CONF.my_modules   + 'email.js');
var wf    = require(CONF.my_modules   + 'wf.js');

// start();
function start () {
  set_watch_parcer_error();
}
exports.start = start;


// следим за файлом ошибок процесса, который парсит данны для базы
// и шлем email
function set_watch_parcer_error () {
  try {
    fs.watchFile('/root/.pm2/logs/cron-worker-error-20.log', function (curr, prev) {
      // console.log('the current mtime is: ' + curr.mtime);
      // console.log('the previous mtime was: ' + prev.mtime);
      if (CONF.watch_parser_error === 1) {
        wf.read_file('/root/.pm2/logs/cron-worker-error-20.log', function(err, res) {
          if (!err && !/^\s+$/.test(res)) {
            var data = email.to_gmail({
              subject: 'Error: in parser',
              text: 'File: /root/.pm2/logs/cron-worker-error-20.log \n'+res
            });
            email.send(data);
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    var data = email.to_gmail({
      subject: 'Error: in watchers.js => set_watch_parcer_error',
      text: 'Can\'t watch /root/.pm2/logs/cron-worker-error-20.log \n'+err
    });
    email.send(data);
  }

}

